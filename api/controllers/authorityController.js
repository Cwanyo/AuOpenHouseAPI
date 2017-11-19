"use strict";

/*Firebase*/
var firebase = require("../firebase");

exports.Authentication = function(req, res, next) {
    if (req.session.aid) {
        console.log("Authentication Passed", req.method, req.url);
        next();
    } else {
        res.sendStatus(401);
    }
}

exports.SetTimeZone = function(req, res, next) {

    req.getConnection(function(err, conn) {

        if (err) return next("Cannot Connect");

        var query = conn.query("SET SESSION time_zone = '+7:00';",
            function(err, results, fields) {
                if (err) {
                    console.log(err);
                    return next("Mysql error, check your query");
                }
                next();
            });
    });

}

exports.welcome_page = function(req, res, next) {
    res.send("Welcome to AuOpenHouse-Authority APIS");
}

exports.login = function(req, res, next) {

    //validation
    req.assert("idToken", "idToken is required").notEmpty();

    var errors = req.validationErrors();
    if (errors) {
        res.status(422).json(errors);
        return;
    }

    firebase.auth().verifyIdToken(req.body.idToken)
        .then(function(decodedToken) {
            var data = {
                aid: decodedToken.uid,
                name: decodedToken.name,
                image: decodedToken.picture,
                email: decodedToken.email
            };

            req.getConnection(function(err, conn) {

                if (err) return next("Cannot Connect");

                var query = conn.query(
                    "SELECT * " +
                    "FROM heroku_8fddb363146ffaf.authority " +
                    "WHERE aid = ?;", [data.aid],
                    function(err, results, fields) {
                        if (err) {
                            console.log(err);
                            return next("Mysql error, check your query");
                        }

                        if (results.length == 1) {

                            switch (results[0].Accout_Approval) {
                                case 1:
                                    //Regenerate session
                                    req.session.regenerate(function() {
                                        req.session.aid = data.aid;
                                        req.session.role = results[0].Role;
                                        res.status(200).json({ "isSuccess": true, "message": "Authentication Passed", "role": results[0].Role });
                                    });
                                    break;
                                case 0:
                                    res.status(401).json({ "isSuccess": false, "message": "Authority account not approved yet" });
                                    break;
                                case -1:
                                    res.status(401).json({ "isSuccess": false, "message": "Authority account was banned" });
                                    break;
                            }

                        } else {
                            res.status(401).json({ "isSuccess": false, "message": "Authority not found" });
                        }

                    });
            });

        })
        .catch(function(error) {
            res.status(401).json({ "isSuccess": false, "message": "Fail to Verify IdToken" });
        });

}

exports.logout = function(req, res, next) {

    if (req.session) {
        //Delete session object
        req.session.destroy(function(err) {
            if (err) {
                return next(err);
            } else {
                return res.sendStatus(204);
            }
        });
    }

}

exports.list_faculties = function(req, res, next) {

    req.getConnection(function(err, conn) {

        if (err) return next("Cannot Connect");

        var query = conn.query(
            "SELECT * " +
            "FROM heroku_8fddb363146ffaf.faculty; ",
            function(err, results, fields) {
                if (err) {
                    console.log(err);
                    return next("Mysql error, check your query");
                }

                res.status(200).json(results);
            });
    });

}

exports.faculty_info = function(req, res, next) {

    var faculty_id = req.params.faculty_id;

    req.getConnection(function(err, conn) {

        if (err) return next("Cannot Connect");

        var query = conn.query(
            "SELECT * " +
            "FROM heroku_8fddb363146ffaf.faculty " +
            "WHERE fid = ?; ", [faculty_id],
            function(err, results, fields) {
                if (err) {
                    console.log(err);
                    return next("Mysql error, check your query");
                }

                if (results.length < 1) {
                    return res.status(404).send("Faculty not found");
                }

                res.status(200).json(results);
            });
    });

}

exports.list_majors = function(req, res, next) {

    var faculty_id = req.params.faculty_id;

    req.getConnection(function(err, conn) {

        if (err) return next("Cannot Connect");

        var query = conn.query(
            "SELECT * " +
            "FROM heroku_8fddb363146ffaf.major " +
            "WHERE fid = ?; ", [faculty_id],
            function(err, results, fields) {
                if (err) {
                    console.log(err);
                    return next("Mysql error, check your query");
                }

                res.status(200).json(results);
            });
    });

}

exports.major_info = function(req, res, next) {

    var faculty_id = req.params.faculty_id;
    var major_id = req.params.major_id;

    req.getConnection(function(err, conn) {

        if (err) return next("Cannot Connect");

        var query = conn.query(
            "SELECT * " +
            "FROM heroku_8fddb363146ffaf.major " +
            "WHERE fid = ? and mid = ?; ", [faculty_id, major_id],
            function(err, results, fields) {
                if (err) {
                    console.log(err);
                    return next("Mysql error, check your query");
                }

                if (results.length < 1) {
                    return res.status(404).send("Major not found");
                }

                res.status(200).json(results);
            });
    });

}

exports.list_upcoming_events = function(req, res, next) {

    req.getConnection(function(err, conn) {

        if (err) return next("Cannot Connect");

        var query = conn.query(
            "SELECT * " +
            "FROM heroku_8fddb363146ffaf.event natural join heroku_8fddb363146ffaf.event_time " +
            "WHERE current_timestamp() between Time_Start-interval 1 hour and Time_End; ",
            function(err, results, fields) {
                if (err) {
                    console.log(err);
                    return next("Mysql error, check your query");
                }

                if (results.length < 1) {
                    return res.status(404).send("Upcoming events not found");
                }

                res.status(200).json(results);
            });
    });

}

exports.list_authority_attended_events = function(req, res, next) {

    var sid = req.session.sid;

    req.getConnection(function(err, conn) {

        if (err) return next("Cannot Connect");

        var query = conn.query(
            "SELECT * " +
            "FROM heroku_8fddb363146ffaf.event_time NATURAL JOIN heroku_8fddb363146ffaf.event " +
            "WHERE tid IN ( " +
            "SELECT tid " +
            "FROM heroku_8fddb363146ffaf.student_attend_event_time " +
            "WHERE sid = ?) ", [sid],
            function(err, results, fields) {
                if (err) {
                    console.log(err);
                    return next("Mysql error, check your query");
                }

                if (results.length < 1) {
                    return res.status(404).send("Events not found");
                }

                res.status(200).json(results);
            });
    });

}

exports.authority_join_event = function(req, res, next) {

    var time_id = req.params.time_id;

    var sid = req.session.sid;

    req.getConnection(function(err, conn) {

        if (err) return next("Cannot Connect");

        var query = conn.query(
            "INSERT INTO `heroku_8fddb363146ffaf`.`student_attend_event_time` (`SID`, `TID`) " +
            "VALUES (?, ?); ", [sid, time_id],
            function(err, results, fields) {
                if (err) {
                    switch (err.code) {
                        case "ER_DUP_ENTRY":
                            console.log("duplicate entry");
                            res.status(200).json({ "isSuccess": true, "message": "Already joined the event" });
                            break;
                        case "ER_NO_REFERENCED_ROW_2":
                            console.log("event time not found");
                            res.status(404).json({ "isSuccess": false, "message": "Event not found" });
                            break;
                    }
                    console.log(err);
                    return next("Mysql error, check your query");
                }

                res.status(200).json({ "isSuccess": true, "message": "Joined the event" });
            });
    });

}

exports.list_events = function(req, res, next) {

    req.getConnection(function(err, conn) {

        if (err) return next("Cannot Connect");

        var query = conn.query(
            "SELECT * " +
            "FROM heroku_8fddb363146ffaf.event; ",
            function(err, results, fields) {
                if (err) {
                    console.log(err);
                    return next("Mysql error, check your query");
                }

                res.status(200).json(results);
            });
    });

}

exports.event_info = function(req, res, next) {

    var event_id = req.params.event_id;

    req.getConnection(function(err, conn) {

        if (err) return next("Cannot Connect");

        var query = conn.query(
            "SELECT * " +
            "FROM heroku_8fddb363146ffaf.event " +
            "WHERE eid = ?; ", [event_id],
            function(err, results, fields) {
                if (err) {
                    console.log(err);
                    return next("Mysql error, check your query");
                }

                if (results.length < 1) {
                    return res.status(404).send("Event not found");
                }

                res.status(200).json(results);
            });
    });

}

exports.list_upcoming_games = function(req, res, next) {

    req.getConnection(function(err, conn) {

        if (err) return next("Cannot Connect");

        var query = conn.query(
            "SELECT * " +
            "FROM heroku_8fddb363146ffaf.game " +
            "WHERE current_timestamp() between Time_Start and Time_End; ",
            function(err, results, fields) {
                if (err) {
                    console.log(err);
                    return next("Mysql error, check your query");
                }

                if (results.length < 1) {
                    return res.status(404).send("Upcoming games not found");
                }

                res.status(200).json(results);
            });
    });

}

exports.list_authority_played_games = function(req, res, next) {

    var sid = req.session.sid;

    req.getConnection(function(err, conn) {

        if (err) return next("Cannot Connect");

        var query = conn.query(
            "SELECT * " +
            "FROM heroku_8fddb363146ffaf.game NATURAL JOIN heroku_8fddb363146ffaf.student_play_game " +
            "WHERE sid = ?; ", [sid],
            function(err, results, fields) {
                if (err) {
                    console.log(err);
                    return next("Mysql error, check your query");
                }

                if (results.length < 1) {
                    return res.status(404).send("Games not found");
                }

                res.status(200).json(results);
            });
    });

}

exports.authority_play_game = function(req, res, next) {

    //validation
    req.assert("points", "points is required").notEmpty();

    var errors = req.validationErrors();
    if (errors) {
        res.status(422).json(errors);
        return;
    }

    var game_id = req.params.game_id;
    var points = req.body.points;

    var sid = req.session.sid;

    req.getConnection(function(err, conn) {

        if (err) return next("Cannot Connect");

        var query = conn.query(
            "INSERT INTO `heroku_8fddb363146ffaf`.`student_play_game` (`SID`, `GID`, `Point`) " +
            "VALUES (?, ?, ?); ", [sid, game_id, points],
            function(err, results, fields) {
                if (err) {
                    switch (err.code) {
                        case "ER_DUP_ENTRY":
                            console.log("duplicate entry");
                            res.status(200).json({ "isSuccess": true, "message": "Already played the game" });
                            break;
                        case "ER_NO_REFERENCED_ROW_2":
                            console.log("game not found");
                            res.status(404).json({ "isSuccess": false, "message": "Game not found" });
                            break;
                    }
                    console.log(err);
                    return next("Mysql error, check your query");
                }

                res.status(200).json({ "isSuccess": true, "message": "Played the game" });
            });
    });

}

exports.list_games = function(req, res, next) {

    req.getConnection(function(err, conn) {

        if (err) return next("Cannot Connect");

        var query = conn.query(
            "SELECT * " +
            "FROM heroku_8fddb363146ffaf.game; ",
            function(err, results, fields) {
                if (err) {
                    console.log(err);
                    return next("Mysql error, check your query");
                }

                res.status(200).json(results);
            });
    });

}

exports.game_info = function(req, res, next) {

    var game_id = req.params.game_id;

    req.getConnection(function(err, conn) {

        if (err) return next("Cannot Connect");

        var query = conn.query(
            "SELECT * " +
            "FROM heroku_8fddb363146ffaf.game " +
            "WHERE gid = ?; ", [game_id],
            function(err, results, fields) {
                if (err) {
                    console.log(err);
                    return next("Mysql error, check your query");
                }

                if (results.length < 1) {
                    return res.status(404).send("Game not found");
                }

                res.status(200).json(results);
            });
    });

}

exports.game_questions = function(req, res, next) {

    var game_id = req.params.game_id;

    req.getConnection(function(err, conn) {

        if (err) return next("Cannot Connect");

        var query = conn.query(
            "SELECT * " +
            "FROM heroku_8fddb363146ffaf.game_question NATURAL JOIN heroku_8fddb363146ffaf.answer_choice " +
            "WHERE gid = ?; ", [game_id],
            function(err, results, fields) {
                if (err) {
                    console.log(err);
                    return next("Mysql error, check your query");
                }

                if (results.length < 1) {
                    return res.status(404).send("Game question not found");
                }

                res.status(200).json(results);
            });
    });

}