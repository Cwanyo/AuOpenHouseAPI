"use strict";

/*Firebase*/
var firebase = require("../firebase");

exports.test = function(req, res, next) {
    console.log("test", req.method, req.url);
    next();
}

exports.Authentication = function(req, res, next) {
    if (req.session.sid) {
        console.log("Authentication student Passed", req.method, req.url);
        next();
    } else {
        return res.status(401).json({ "isSuccess": false, "message": "Unauthorized." });
    }
}

exports.SetTimeZone = function(req, res, next) {

    req.getConnection(function(err, conn) {

        if (err) return next("Cannot Connect");

        conn.query("SET SESSION time_zone = '+7:00';",
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
    res.send("Welcome to AuOpenHouse-Student APIS");
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
                sid: decodedToken.uid,
                name: decodedToken.name,
                image: decodedToken.picture,
                email: decodedToken.email
            };

            req.getConnection(function(err, conn) {

                if (err) return next("Cannot Connect");

                conn.query(
                    "INSERT INTO `heroku_8fddb363146ffaf`.`student` (`SID`, `Name`, `Image`, `Email`) " +
                    "VALUES (?, ?, ?, ?) " +
                    "ON DUPLICATE KEY UPDATE Name = ?, Image = ?, Email = ?; ", [data.sid, data.name, data.image, data.email, data.name, data.image, data.email],
                    function(err, results, fields) {
                        if (err) {
                            console.log(err);
                            return next("Mysql error, check your query");
                        }

                        //Regenerate session
                        req.session.sid = data.sid;
                        res.status(200).json({ "isSuccess": true, "message": "Authentication Passed." });
                    });
            });

        })
        .catch(function(error) {
            res.status(401).json({ "isSuccess": false, "message": "Fail to Verify IdToken." });
        });

}

exports.logout = function(req, res, next) {

    if (req.session) {
        //Delete session object
        req.session = null;
        return res.sendStatus(204);
    }

}

exports.list_faculties = function(req, res, next) {

    req.getConnection(function(err, conn) {

        if (err) return next("Cannot Connect");

        conn.query(
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

        conn.query(
            "SELECT * " +
            "FROM heroku_8fddb363146ffaf.faculty " +
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

exports.list_majors = function(req, res, next) {

    var faculty_id = req.params.faculty_id;

    req.getConnection(function(err, conn) {

        if (err) return next("Cannot Connect");

        conn.query(
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

        conn.query(
            "SELECT * " +
            "FROM heroku_8fddb363146ffaf.major " +
            "WHERE fid = ? and mid = ?; ", [faculty_id, major_id],
            function(err, results, fields) {
                if (err) {
                    console.log(err);
                    return next("Mysql error, check your query");
                }

                res.status(200).json(results);
            });
    });

}

exports.list_upcoming_events = function(req, res, next) {

    req.getConnection(function(err, conn) {

        if (err) return next("Cannot Connect");

        conn.query(
            "SELECT EID, Name, Info, Image, State, Location_Latitude, Location_Longitude, ef.FID, ef.MID, Faculty_Name, Major_Name, ef.TID, Time_Start, Time_End, Icon " +
            "FROM (SELECT EID, Name, Info, Image, State, Location_Latitude, Location_Longitude, e.FID, e.MID, Faculty_Name, e.TID, Time_Start, Time_End, Icon " +
            "FROM (SELECT EID, Name, Info, Image, State, Location_Latitude, Location_Longitude, MID, FID, TID, Time_Start, Time_End " +
            "FROM heroku_8fddb363146ffaf.event NATURAL JOIN heroku_8fddb363146ffaf.event_time WHERE CURRENT_TIMESTAMP() BETWEEN Time_Start - INTERVAL 2 HOUR AND Time_End AND State = 1) AS e " +
            "LEFT JOIN (SELECT FID, Name AS Faculty_Name, Icon " +
            "FROM heroku_8fddb363146ffaf.faculty) AS f ON e.fid = f.fid) AS ef " +
            "LEFT JOIN (SELECT MID, Name AS Major_Name " +
            "FROM heroku_8fddb363146ffaf.major) AS m ON ef.mid = m.mid " +
            "ORDER BY ef.FID ASC; ",
            function(err, results, fields) {
                if (err) {
                    console.log(err);
                    return next("Mysql error, check your query");
                }

                res.status(200).json(results);
            });
    });

}

exports.list_student_attended_events = function(req, res, next) {

    var sid = req.session.sid;

    req.getConnection(function(err, conn) {

        if (err) return next("Cannot Connect");

        conn.query(
            "SELECT EID, Name, Info, Image, State, Location_Latitude, Location_Longitude, FID, MID, TID, Time_Start, Time_End " +
            "FROM heroku_8fddb363146ffaf.event_time NATURAL JOIN heroku_8fddb363146ffaf.event " +
            "WHERE tid IN ( " +
            "SELECT tid " +
            "FROM heroku_8fddb363146ffaf.student_attend_event_time " +
            "WHERE sid = ?) " +
            "ORDER BY Time_Start ASC; ", [sid],
            function(err, results, fields) {
                if (err) {
                    console.log(err);
                    return next("Mysql error, check your query");
                }

                res.status(200).json(results);
            });
    });

}

exports.myevent_info = function(req, res, next) {

    var sid = req.session.sid;
    var time_id = req.params.time_id;

    req.getConnection(function(err, conn) {

        if (err) return next("Cannot Connect");

        conn.query(
            "SELECT * " +
            "FROM heroku_8fddb363146ffaf.student_attend_event_time " +
            "Where sid = ? and tid = ?; ", [sid, time_id],
            function(err, results, fields) {
                if (err) {
                    console.log(err);
                    return next("Mysql error, check your query");
                }

                res.status(200).json(results);
            });
    });

}

exports.student_join_event = function(req, res, next) {

    var time_id = req.params.time_id;

    var sid = req.session.sid;

    req.getConnection(function(err, conn) {

        if (err) return next("Cannot Connect");

        conn.query(
            "INSERT INTO `heroku_8fddb363146ffaf`.`student_attend_event_time` (`SID`, `TID`) " +
            "VALUES (?, ?); ", [sid, time_id],
            function(err, results, fields) {
                if (err) {
                    switch (err.code) {
                        case "ER_DUP_ENTRY":
                            console.log("duplicate entry");
                            res.status(200).json({ "isSuccess": true, "message": "Already joined the event." });
                            break;
                        case "ER_NO_REFERENCED_ROW_2":
                            console.log("event time not found");
                            res.status(404).json({ "isSuccess": false, "message": "Event not found." });
                            break;
                    }
                    console.log(err);
                    return next("Mysql error, check your query");
                }

                res.status(200).json({ "isSuccess": true, "message": "Joined the event." });
            });
    });

}

exports.student_leave_event = function(req, res, next) {

    var time_id = req.params.time_id;

    var sid = req.session.sid;

    req.getConnection(function(err, conn) {

        if (err) return next("Cannot Connect");

        conn.query(
            "DELETE FROM `heroku_8fddb363146ffaf`.`student_attend_event_time` " +
            "WHERE `SID`= ? and `TID` = ?; ", [sid, time_id],
            function(err, results, fields) {
                if (err) {
                    console.log(err);
                    return next("Mysql error, check your query");
                }

                if (results.affectedRows) {
                    res.status(200).json({ "isSuccess": true, "message": "Leaved the event." });
                } else {
                    res.status(400).json({ "isSuccess": false, "message": "Cannot leave event." });
                }
            });
    });

}

exports.list_events = function(req, res, next) {

    req.getConnection(function(err, conn) {

        if (err) return next("Cannot Connect");

        conn.query(
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

        conn.query(
            "SELECT * " +
            "FROM heroku_8fddb363146ffaf.event " +
            "WHERE eid = ?; ", [event_id],
            function(err, results, fields) {
                if (err) {
                    console.log(err);
                    return next("Mysql error, check your query");
                }

                res.status(200).json(results);
            });
    });

}

exports.list_upcoming_games = function(req, res, next) {

    req.getConnection(function(err, conn) {

        if (err) return next("Cannot Connect");

        conn.query(
            "SELECT * " +
            "FROM heroku_8fddb363146ffaf.game " +
            "WHERE current_timestamp() between Time_Start and Time_End; ",
            function(err, results, fields) {
                if (err) {
                    console.log(err);
                    return next("Mysql error, check your query");
                }

                res.status(200).json(results);
            });
    });

}

exports.list_student_played_games = function(req, res, next) {

    var sid = req.session.sid;

    req.getConnection(function(err, conn) {

        if (err) return next("Cannot Connect");

        conn.query(
            "SELECT * " +
            "FROM heroku_8fddb363146ffaf.game NATURAL JOIN heroku_8fddb363146ffaf.student_play_game " +
            "WHERE sid = ?; ", [sid],
            function(err, results, fields) {
                if (err) {
                    console.log(err);
                    return next("Mysql error, check your query");
                }

                res.status(200).json(results);
            });
    });

}

exports.student_play_game = function(req, res, next) {

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

        conn.query(
            "INSERT INTO `heroku_8fddb363146ffaf`.`student_play_game` (`SID`, `GID`, `Point`) " +
            "VALUES (?, ?, ?); ", [sid, game_id, points],
            function(err, results, fields) {
                if (err) {
                    switch (err.code) {
                        case "ER_DUP_ENTRY":
                            console.log("duplicate entry");
                            res.status(200).json({ "isSuccess": true, "message": "Already played the game." });
                            break;
                        case "ER_NO_REFERENCED_ROW_2":
                            console.log("game not found");
                            res.status(404).json({ "isSuccess": false, "message": "Game not found." });
                            break;
                    }
                    console.log(err);
                    return next("Mysql error, check your query");
                }

                res.status(200).json({ "isSuccess": true, "message": "Played the game." });
            });
    });

}

exports.list_games = function(req, res, next) {

    req.getConnection(function(err, conn) {

        if (err) return next("Cannot Connect");

        conn.query(
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

        conn.query(
            "SELECT * " +
            "FROM heroku_8fddb363146ffaf.game " +
            "WHERE gid = ?; ", [game_id],
            function(err, results, fields) {
                if (err) {
                    console.log(err);
                    return next("Mysql error, check your query");
                }

                res.status(200).json(results);
            });
    });

}

exports.game_questions = function(req, res, next) {

    var game_id = req.params.game_id;

    req.getConnection(function(err, conn) {

        if (err) return next("Cannot Connect");

        conn.query(
            "SELECT * " +
            "FROM heroku_8fddb363146ffaf.game_question NATURAL JOIN heroku_8fddb363146ffaf.answer_choice " +
            "WHERE gid = ?; ", [game_id],
            function(err, results, fields) {
                if (err) {
                    console.log(err);
                    return next("Mysql error, check your query");
                }

                res.status(200).json(results);
            });
    });

}