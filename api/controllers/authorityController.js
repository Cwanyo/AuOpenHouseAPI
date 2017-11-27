"use strict";
//TODO - replace return error 
/*Firebase*/
var firebase = require("../firebase");

exports.AuthenticationStaff = function(req, res, next) {
    if (req.session.aid) {
        console.log("Authentication staff Passed", req.method, req.url);
        next();
    } else {
        return res.status(401).json({ "isSuccess": false, "message": "Unauthorized." });
    }
}

exports.AuthenticationAdmin = function(req, res, next) {
    if (req.session.aid && req.session.role == "admin") {
        console.log("Authentication admin Passed", req.method, req.url);
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
                    return next("Mysql error, check your query at SetTimeZone");
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

            //allow only AU google account
            //u5715298@au.edu
            if (data.email.split("@")[1] != "au.edu") {
                return res.status(401).json({ "isSuccess": false, "message": "Authority must use AU Google account." });
            }

            req.getConnection(function(err, conn) {

                if (err) return next("Cannot Connect");

                conn.query(
                    "SELECT * " +
                    "FROM heroku_8fddb363146ffaf.authority " +
                    "WHERE aid = ?;", [data.aid],
                    function(err, results, fields) {
                        if (err) {
                            console.log(err);
                            return next("Mysql error, check your query at login");
                        }

                        if (results.length == 1) {

                            switch (results[0].Accout_Approval) {
                                case 1:
                                    //Regenerate session
                                    req.session.aid = data.aid;
                                    req.session.role = results[0].Role;
                                    res.status(200).json({ "isSuccess": true, "message": "Authentication Passed.", "role": results[0].Role });
                                    break;
                                case 0:
                                    res.status(401).json({ "isSuccess": false, "message": "Authority account not approved yet, Please wait for admin approval." });
                                    break;
                                case -1:
                                    res.status(401).json({ "isSuccess": false, "message": "Authority account was banned, Please contact admin." });
                                    break;
                            }

                        } else {
                            res.status(401).json({ "isSuccess": false, "message": "Authority not found." });
                        }

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

exports.request = function(req, res, next) {

    //validation
    req.assert("request", "request is required").notEmpty();

    var errors = req.validationErrors();
    if (errors) {
        res.status(422).json(errors);
        return;
    }

    var request = req.body.request;

    firebase.auth().verifyIdToken(request.idToken)
        .then(function(decodedToken) {

            var data = {
                aid: decodedToken.uid,
                name: decodedToken.name,
                image: decodedToken.picture,
                email: decodedToken.email
            };

            //allow only AU google account
            //u5715298@au.edu
            if (data.email.split("@")[1] != "au.edu") {
                return res.status(401).json({ "isSuccess": false, "message": "Authority must use AU Google account." });
            }

            req.getConnection(function(err, conn) {

                if (err) return next("Cannot Connect");

                conn.query(
                    "SELECT * " +
                    "FROM heroku_8fddb363146ffaf.authority " +
                    "WHERE aid = ?;", [data.aid],
                    function(err, results, fields) {
                        if (err) {
                            console.log(err);
                            return next("Mysql error, check your query at request");
                        }

                        if (results.length == 1 && results[0].Accout_Approval != 0) {
                            switch (results[0].Accout_Approval) {
                                case 1:
                                    //cannot change anything
                                    res.status(400).json({ "isSuccess": false, "message": "Authority account already approved." });
                                    break;
                                case -1:
                                    //account baned
                                    res.status(401).json({ "isSuccess": false, "message": "Authority account was banned, Please contact admin." });
                                    break;
                            }
                        } else {
                            //add new request if not exits
                            //OR
                            //if request already exits but not approved yet, user can change the role, faculty or major
                            conn.query(
                                "INSERT INTO `heroku_8fddb363146ffaf`.`authority` (`AID`, `Name`, `Image`, `Email`, `Role`, `MID`, `FID`) " +
                                "VALUES (?, ?, ?, ?, ?, ?, ?) " +
                                "ON DUPLICATE KEY UPDATE Role = ?, MID = ?, FID = ?; ", [data.aid, data.name, data.image, data.email, request.Role, request.MID, request.FID, request.Role, request.MID, request.FID],
                                function(err, results, fields) {
                                    if (err) {
                                        console.log(err);
                                        return next("Mysql error, check your query at request(2)");
                                    }

                                    res.status(200).json({ "isSuccess": true, "message": "Authority account already requested." });
                                });
                        }
                    });
            });

        })
        .catch(function(error) {
            res.status(401).json({ "isSuccess": false, "message": "Fail to Verify IdToken." });
        });

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
                    return next("Mysql error, check your query at list_faculties");
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
                    return next("Mysql error, check your query at list_majors");
                }

                res.status(200).json(results);
            });
    });

}

exports.list_events = function(req, res, next) {

    var state = req.params.state;

    req.getConnection(function(err, conn) {

        if (err) return next("Cannot Connect");

        conn.query(
            "SELECT EID, Name, Info, Image, State, Location_Latitude, Location_Longitude, ef.FID, ef.MID, Faculty_Name, Major_Name, Icon " +
            "FROM (SELECT EID, Name, Info, Image, State, Location_Latitude, Location_Longitude, e.FID, e.MID, Faculty_Name, Icon " +
            "FROM heroku_8fddb363146ffaf.event AS e LEFT JOIN ( " +
            "SELECT FID, Name AS Faculty_Name, Icon " +
            "FROM heroku_8fddb363146ffaf.faculty) AS f ON e.fid = f.fid) AS ef LEFT JOIN ( " +
            "SELECT MID, Name AS Major_Name " +
            "FROM heroku_8fddb363146ffaf.major) AS m ON ef.mid = m.mid " +
            "WHERE state = ? " +
            "ORDER BY ef.FID ASC; ", [state],
            function(err, results, fields) {
                if (err) {
                    console.log(err);
                    return next("Mysql error, check your query at list_events");
                }

                res.status(200).json(results);
            });
    });

}

exports.add_events = function(req, res, next) {

    //validation
    req.assert("event", "event is required").notEmpty();

    var errors = req.validationErrors();
    if (errors) {
        res.status(422).json(errors);
        return;
    }

    var aid = req.session.aid;

    var event = req.body.event;

    req.getConnection(function(err, conn) {

        if (err) return next("Cannot Connect");

        conn.query(
            "INSERT INTO `heroku_8fddb363146ffaf`.`event` (`Name`, `Info`, `Image`, `Location_Latitude`, `Location_Longitude`, `MID`, `FID`) " +
            "VALUES (?, ?, ?, ?, ?, ?, ?); ", [event.Name, event.Info, event.Image, event.Location_Latitude, event.Location_Longitude, event.MID, event.FID],
            function(err, results, fields) {
                if (err) {
                    console.log(err);
                    return next("Mysql error, check your query at add_events(1)");
                }

                if (results.insertId) {

                    event.Event_Time.forEach(t => {
                        conn.query(
                            "INSERT INTO `heroku_8fddb363146ffaf`.`event_time` (`EID`, `Time_Start`, `Time_End`) " +
                            "VALUES (?, ?, ?); ", [results.insertId, t.Time_Start, t.Time_End],
                            function(err, results, fields) {
                                if (err) {
                                    console.log(err);
                                    return next("Mysql error, check your query at add_events(2)");
                                }
                            });
                    });

                    conn.query(
                        "INSERT INTO `heroku_8fddb363146ffaf`.`event_log` (`EID`, `AID`, `Log` ) " +
                        "VALUES (?, ?, ?); ", [results.insertId, aid, "created"],
                        function(err, results, fields) {
                            if (err) {
                                console.log(err);
                                return next("Mysql error, check your query at add_events(3)");
                            }
                        });

                    res.status(200).json({ "isSuccess": true, "message": "Event added." });

                } else {
                    res.status(400).json({ "isSuccess": false, "message": "Cannot add event." });
                }

            });
    });

}

exports.edit_events = function(req, res, next) {

    //validation
    req.assert("event", "event is required").notEmpty();

    var errors = req.validationErrors();
    if (errors) {
        res.status(422).json(errors);
        return;
    }

    var aid = req.session.aid;

    var event = req.body.event;

    req.getConnection(function(err, conn) {

        if (err) return next("Cannot Connect");

        conn.query(
            "UPDATE `heroku_8fddb363146ffaf`.`event` " +
            "SET `Name`= ?, `Info`= ?, `Image`= ?, `State`= ?, `Location_Latitude`= ?, `Location_Longitude`= ?, `MID`= ?, `FID`= ? " +
            "WHERE `EID`= ?;", [event.Name, event.Info, event.Image, event.State, event.Location_Latitude, event.Location_Longitude, event.MID, event.FID, event.EID],
            function(err, results, fields) {
                if (err) {
                    console.log(err);
                    return next("Mysql error, check your query at edit_events(1)");
                }

                event.Event_Time.forEach(t => {
                    if (t.TID) {
                        //Edit time
                        conn.query(
                            "UPDATE `heroku_8fddb363146ffaf`.`event_time` " +
                            "SET `Time_Start`= ?, `Time_End`= ? " +
                            "WHERE `TID` = ?; ", [t.Time_Start, t.Time_End, t.TID],
                            function(err, results, fields) {
                                if (err) {
                                    console.log(err);
                                    return next("Mysql error, check your query at edit_events(2)");
                                }
                            });
                    } else {
                        //Add new time
                        conn.query(
                            "INSERT INTO `heroku_8fddb363146ffaf`.`event_time` (`EID`, `Time_Start`, `Time_End`) " +
                            "VALUES (?, ?, ?); ", [event.EID, t.Time_Start, t.Time_End],
                            function(err, results, fields) {
                                if (err) {
                                    console.log(err);
                                    return next("Mysql error, check your query at edit_events(3)");
                                }
                            });
                    }
                });

                conn.query(
                    "INSERT INTO `heroku_8fddb363146ffaf`.`event_log` (`EID`, `AID`, `Log` ) " +
                    "VALUES (?, ?, ?); ", [event.EID, aid, "edited"],
                    function(err, results, fields) {
                        if (err) {
                            console.log(err);
                            return next("Mysql error, check your query at edit_events(4)");
                        }
                    });

                res.status(200).json({ "isSuccess": true, "message": "Event edited." });

            });
    });

}

exports.disable_event_time = function(req, res, next) {

    var aid = req.session.aid;

    var event_id = req.params.event_id;
    var time_id = req.params.time_id;

    req.getConnection(function(err, conn) {

        if (err) return next("Cannot Connect");

        conn.query(
            "UPDATE `heroku_8fddb363146ffaf`.`event_time`  " +
            "SET `State`='0' " +
            "WHERE `EID`= ? AND `TID`= ?; ", [event_id, time_id],
            function(err, results, fields) {
                if (err) {
                    console.log(err);
                    return next("Mysql error, check your query at disable_event_time(1)");
                }

                if (results.changedRows) {

                    conn.query(
                        "INSERT INTO `heroku_8fddb363146ffaf`.`event_log` (`EID`, `AID`, `Log` ) " +
                        "VALUES (?, ?, ?) ", [event_id, aid, "deleted TID: " + time_id],
                        function(err, results, fields) {
                            if (err) {
                                console.log(err);
                                return next("Mysql error, check your query at disable_event_time(2)");
                            }
                        });

                    res.status(200).json({ "isSuccess": true, "message": "Event time deleted." });

                } else {
                    res.status(400).json({ "isSuccess": false, "message": "Cannot delete event time." });
                }

            });
    });

}

exports.event_times = function(req, res, next) {

    var event_id = req.params.event_id;

    req.getConnection(function(err, conn) {

        if (err) return next("Cannot Connect");

        conn.query(
            "SELECT * " +
            "FROM heroku_8fddb363146ffaf.event_time " +
            "WHERE eid = ? AND state = 1; ", [event_id],
            function(err, results, fields) {
                if (err) {
                    console.log(err);
                    return next("Mysql error, check your query at event_time");
                }

                res.status(200).json(results);
            });
    });

}

exports.list_event_time_attendees = function(req, res, next) {

    var event_id = req.params.event_id;
    var time_id = req.params.time_id;

    req.getConnection(function(err, conn) {

        if (err) return next("Cannot Connect");

        conn.query(
            "SELECT * " +
            "FROM heroku_8fddb363146ffaf.student_attend_event_time NATURAL JOIN heroku_8fddb363146ffaf.student " +
            "WHERE tid = ?; ", [time_id],
            function(err, results, fields) {
                if (err) {
                    console.log(err);
                    return next("Mysql error, check your query at list_event_time_attendees");
                }

                res.status(200).json(results);
            });
    });

}

exports.disable_events = function(req, res, next) {

    var aid = req.session.aid;

    var event_id = req.params.event_id;

    req.getConnection(function(err, conn) {

        if (err) return next("Cannot Connect");

        conn.query(
            "UPDATE `heroku_8fddb363146ffaf`.`event`  " +
            "SET `State`='0' " +
            "WHERE `EID`= ?; ", [event_id],
            function(err, results, fields) {
                if (err) {
                    console.log(err);
                    return next("Mysql error, check your query at disable_events");
                }

                if (results.changedRows) {

                    conn.query(
                        "INSERT INTO `heroku_8fddb363146ffaf`.`event_log` (`EID`, `AID`, `Log` ) " +
                        "VALUES (?, ?, ?) ", [event_id, aid, "deleted"],
                        function(err, results, fields) {
                            if (err) {
                                console.log(err);
                                return next("Mysql error, check your query at disable_events log");
                            }
                        });

                    res.status(200).json({ "isSuccess": true, "message": "Event deleted." });

                } else {
                    res.status(400).json({ "isSuccess": false, "message": "Cannot delete event." });
                }

            });
    });

}

exports.list_games = function(req, res, next) {

    var state = req.params.state;

    req.getConnection(function(err, conn) {

        if (err) return next("Cannot Connect");

        conn.query(
            "SELECT GID, Name, Info, Image, Time_Start, Time_End, State, Location_Latitude, Location_Longitude, ef.FID, ef.MID, Faculty_Name, Major_Name, Icon " +
            "FROM (SELECT GID, Name, Info, Image, Time_Start, Time_End, State, Location_Latitude, Location_Longitude, e.FID, e.MID, Faculty_Name, Icon " +
            "FROM heroku_8fddb363146ffaf.game AS e LEFT JOIN ( " +
            "SELECT FID, Name AS Faculty_Name, Icon " +
            "FROM heroku_8fddb363146ffaf.faculty) AS f ON e.fid = f.fid) AS ef LEFT JOIN ( " +
            "SELECT MID, Name AS Major_Name " +
            "FROM heroku_8fddb363146ffaf.major) AS m ON ef.mid = m.mid " +
            "WHERE state = ? " +
            "ORDER BY ef.FID ASC; ", [state],
            function(err, results, fields) {
                if (err) {
                    console.log(err);
                    return next("Mysql error, check your query at list_games");
                }

                res.status(200).json(results);
            });
    });

}

exports.add_games = function(req, res, next) {

    //validation
    req.assert("game", "game is required").notEmpty();

    var errors = req.validationErrors();
    if (errors) {
        res.status(422).json(errors);
        return;
    }

    var aid = req.session.aid;

    var game = req.body.game;

    req.getConnection(function(err, conn) {

        if (err) return next("Cannot Connect");

        conn.query(
            "INSERT INTO `heroku_8fddb363146ffaf`.`game` (`Name`, `Info`, `Image`, `Time_Start`, `Time_End`, `Location_Latitude`, `Location_Longitude`, `MID`, `FID`) " +
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?); ", [game.Name, game.Info, game.Image, game.Time_Start, game.Time_End, game.Location_Latitude, game.Location_Longitude, game.MID, game.FID],
            function(err, results, fields) {
                if (err) {
                    console.log(err);
                    return next("Mysql error, check your query at add_games(1)");
                }

                if (results.insertId) {

                    game.Game_Question.forEach(q => {
                        conn.query(
                            "INSERT INTO `heroku_8fddb363146ffaf`.`game_question` (`GID`, `Question`) " +
                            "VALUES (?, ?); ", [results.insertId, q.Question],
                            function(err, results, fields) {
                                if (err) {
                                    console.log(err);
                                    return next("Mysql error, check your query at add_games(2)");
                                }

                                if (results.insertId) {

                                    var QID = results.insertId;
                                    var RightChoice = parseInt(q.Right_Choice);
                                    var CountChoice = 1;

                                    q.Answer_Choice.forEach(a => {
                                        //create new var because inside func can't access
                                        var c = CountChoice;

                                        conn.query(
                                            "INSERT INTO `heroku_8fddb363146ffaf`.`answer_choice` (`QID`, `Choice`) " +
                                            "VALUES (?, ?); ", [results.insertId, a.Choice],
                                            function(err, results, fields) {
                                                if (err) {
                                                    console.log(err);
                                                    return next("Mysql error, check your query at add_games(3)");
                                                }
                                                //if current choice = rightchoice
                                                if (c == RightChoice) {
                                                    conn.query(
                                                        "UPDATE `heroku_8fddb363146ffaf`.`game_question` " +
                                                        "SET `Right_Choice`= ? " +
                                                        "WHERE `QID`= ? ", [results.insertId, QID],
                                                        function(err, results, fields) {
                                                            if (err) {
                                                                console.log(err);
                                                                return next("Mysql error, check your query at add_games(4)");
                                                            }
                                                        });
                                                }
                                            });
                                        CountChoice++;
                                    });
                                }
                            });
                    });

                    conn.query(
                        "INSERT INTO `heroku_8fddb363146ffaf`.`game_log` (`GID`, `AID`, `Log` ) " +
                        "VALUES (?, ?, ?); ", [results.insertId, aid, "created"],
                        function(err, results, fields) {
                            if (err) {
                                console.log(err);
                                return next("Mysql error, check your query at add_games(4)");
                            }
                        });

                    res.status(200).json({ "isSuccess": true, "message": "Game added." });

                } else {
                    res.status(400).json({ "isSuccess": false, "message": "Cannot add game." });
                }

            });
    });

}

exports.edit_games = function(req, res, next) {

    //validation
    req.assert("game", "game is required").notEmpty();

    var errors = req.validationErrors();
    if (errors) {
        res.status(422).json(errors);
        return;
    }

    var aid = req.session.aid;

    var game = req.body.game;

    req.getConnection(function(err, conn) {

        if (err) return next("Cannot Connect");

        conn.query(
            "UPDATE `heroku_8fddb363146ffaf`.`game` " +
            "SET `Name`= ?, `Info`= ?, `Image`= ?, `Time_Start`=?, `Time_End`=?, `State`= ?, `Location_Latitude`= ?, `Location_Longitude`= ?, `MID`= ?, `FID`= ? " +
            "WHERE `GID`= ?;", [game.Name, game.Info, game.Image, game.Time_Start, game.Time_End, game.State, game.Location_Latitude, game.Location_Longitude, game.MID, game.FID, game.GID],
            function(err, results, fields) {
                if (err) {
                    console.log(err);
                    return next("Mysql error, check your query at edit_games(1)");
                }
                game.Game_Question.forEach(q => {
                    if (q.QID) {
                        //Edit question
                        conn.query(
                            "UPDATE `heroku_8fddb363146ffaf`.`game_question` " +
                            "SET `Question`= ?, `Right_Choice`= ? " +
                            "WHERE `QID` = ?; ", [q.Question, q.Right_Choice, q.QID],
                            function(err, results, fields) {
                                if (err) {
                                    console.log(err);
                                    return next("Mysql error, check your query at edit_games(2)");
                                }

                                var QID = q.QID;
                                var RightChoice = parseInt(q.Right_Choice);

                                q.Answer_Choice.forEach(a => {
                                    //create new var because inside func can't access

                                    conn.query(
                                        "UPDATE `heroku_8fddb363146ffaf`.`answer_choice` " +
                                        "SET `Choice` = ? " +
                                        "WHERE `CID` = ? and `QID` = ?; ", [a.Choice, a.CID, QID],
                                        function(err, results, fields) {
                                            if (err) {
                                                console.log(err);
                                                return next("Mysql error, check your query at edit_games(2.1)");
                                            }
                                            //if current choice = rightchoice
                                            if (a.CID == RightChoice) {
                                                conn.query(
                                                    "UPDATE `heroku_8fddb363146ffaf`.`game_question` " +
                                                    "SET `Right_Choice`= ? " +
                                                    "WHERE `QID`= ? ", [RightChoice, QID],
                                                    function(err, results, fields) {
                                                        if (err) {
                                                            console.log(err);
                                                            return next("Mysql error, check your query at edit_games(2.2)");
                                                        }
                                                    });
                                            }
                                        });
                                });

                            });
                    } else {
                        //Add new question
                        conn.query(
                            "INSERT INTO `heroku_8fddb363146ffaf`.`game_question` (`GID`, `Question`) " +
                            "VALUES (?, ?); ", [game.GID, q.Question],
                            function(err, results, fields) {
                                if (err) {
                                    console.log(err);
                                    return next("Mysql error, check your query at edit_games(3)");
                                }

                                if (results.insertId) {

                                    var QID = results.insertId;
                                    var RightChoice = parseInt(q.Right_Choice);
                                    var CountChoice = 1;

                                    q.Answer_Choice.forEach(a => {
                                        //create new var because inside func can't access
                                        var c = CountChoice;

                                        conn.query(
                                            "INSERT INTO `heroku_8fddb363146ffaf`.`answer_choice` (`QID`, `Choice`) " +
                                            "VALUES (?, ?); ", [results.insertId, a.Choice],
                                            function(err, results, fields) {
                                                if (err) {
                                                    console.log(err);
                                                    return next("Mysql error, check your query at edit_games(3.1)");
                                                }
                                                //if current choice = rightchoice
                                                if (c == RightChoice) {
                                                    conn.query(
                                                        "UPDATE `heroku_8fddb363146ffaf`.`game_question` " +
                                                        "SET `Right_Choice`= ? " +
                                                        "WHERE `QID`= ? ", [results.insertId, QID],
                                                        function(err, results, fields) {
                                                            if (err) {
                                                                console.log(err);
                                                                return next("Mysql error, check your query at edit_games(3.2)");
                                                            }
                                                        });
                                                }
                                            });
                                        CountChoice++;
                                    });
                                }
                            });
                    }
                });

                conn.query(
                    "INSERT INTO `heroku_8fddb363146ffaf`.`game_log` (`GID`, `AID`, `Log` ) " +
                    "VALUES (?, ?, ?); ", [game.GID, aid, "edited"],
                    function(err, results, fields) {
                        if (err) {
                            console.log(err);
                            return next("Mysql error, check your query at edit_games(4)");
                        }
                    });

                res.status(200).json({ "isSuccess": true, "message": "Game edited." });

            });
    });

}

exports.disable_games = function(req, res, next) {

    var aid = req.session.aid;

    var game_id = req.params.game_id;

    req.getConnection(function(err, conn) {

        if (err) return next("Cannot Connect");

        conn.query(
            "UPDATE `heroku_8fddb363146ffaf`.`game`  " +
            "SET `State`='0' " +
            "WHERE `GID`= ?; ", [game_id],
            function(err, results, fields) {
                if (err) {
                    console.log(err);
                    return next("Mysql error, check your query at disable_games");
                }

                if (results.changedRows) {

                    conn.query(
                        "INSERT INTO `heroku_8fddb363146ffaf`.`game_log` (`GID`, `AID`, `Log` ) " +
                        "VALUES (?, ?, ?) ", [game_id, aid, "deleted"],
                        function(err, results, fields) {
                            if (err) {
                                console.log(err);
                                return next("Mysql error, check your query at disable_games log");
                            }
                        });

                    res.status(200).json({ "isSuccess": true, "message": "Game deleted." });

                } else {
                    res.status(400).json({ "isSuccess": false, "message": "Cannot delete game." });
                }

            });
    });

}

exports.game_questions = function(req, res, next) {

    var game_id = req.params.game_id;

    req.getConnection(function(err, conn) {

        if (err) return next("Cannot Connect");

        conn.query(
            "SELECT * " +
            "FROM heroku_8fddb363146ffaf.game_question " +
            "WHERE gid = ?; ", [game_id],
            function(err, results, fields) {
                if (err) {
                    console.log(err);
                    return next("Mysql error, check your query at game_questions");
                }

                res.status(200).json(results);
            });
    });

}

exports.delete_game_question = function(req, res, next) {

    var aid = req.session.aid;

    var game_id = req.params.game_id;
    var question_id = req.params.question_id;

    req.getConnection(function(err, conn) {

        if (err) return next("Cannot Connect");

        conn.query(
            "DELETE FROM `heroku_8fddb363146ffaf`.`game_question` " +
            "WHERE `QID` = ? and `GID` = ?; ", [question_id, game_id],
            function(err, results, fields) {
                if (err) {
                    console.log(err);
                    return next("Mysql error, check your query at delete_game_question(1)");
                }

                if (results.affectedRows) {

                    conn.query(
                        "INSERT INTO `heroku_8fddb363146ffaf`.`game_log` (`GID`, `AID`, `Log` ) " +
                        "VALUES (?, ?, ?); ", [game_id, aid, "deleted QID: " + question_id],
                        function(err, results, fields) {
                            if (err) {
                                console.log(err);
                                return next("Mysql error, check your query at delete_game_question(2)");
                            }
                        });

                    res.status(200).json({ "isSuccess": true, "message": "Game question deleted." });

                } else {
                    res.status(400).json({ "isSuccess": false, "message": "Cannot delete game question." });
                }

            });
    });

}

exports.answer_choices = function(req, res, next) {

    var game_id = req.params.game_id;
    var question_id = req.params.question_id;

    req.getConnection(function(err, conn) {

        if (err) return next("Cannot Connect");

        conn.query(
            "SELECT * " +
            "FROM heroku_8fddb363146ffaf.answer_choice " +
            "WHERE qid = ?; ", [question_id],
            function(err, results, fields) {
                if (err) {
                    console.log(err);
                    return next("Mysql error, check your query at answer_choices");
                }

                res.status(200).json(results);
            });
    });

}

exports.list_authorities_account = function(req, res, next) {

    var approval_status = req.params.approval_status;

    req.getConnection(function(err, conn) {

        if (err) return next("Cannot Connect");

        conn.query(
            "SELECT AID, Name, Image, Email, Role, Accout_Approval, ef.FID, ef.MID, Faculty_Name, Major_Name, Icon " +
            "FROM (SELECT AID, Name, Image, Email, Role, Accout_Approval, e.FID, e.MID, Faculty_Name, Icon " +
            "FROM heroku_8fddb363146ffaf.authority AS e LEFT JOIN ( " +
            "SELECT FID, Name AS Faculty_Name, Icon " +
            "FROM heroku_8fddb363146ffaf.faculty) AS f ON e.fid = f.fid) AS ef LEFT JOIN ( " +
            "SELECT MID, Name AS Major_Name " +
            "FROM heroku_8fddb363146ffaf.major) AS m ON ef.mid = m.mid " +
            "WHERE Accout_Approval = ? " +
            "ORDER BY ef.FID ASC; ", [approval_status],
            function(err, results, fields) {
                if (err) {
                    console.log(err);
                    return next("Mysql error, check your query at list_events");
                }

                res.status(200).json(results);
            });
    });

}

exports.edit_authority = function(req, res, next) {

    //validation
    req.assert("authority", "authority is required").notEmpty();

    var errors = req.validationErrors();
    if (errors) {
        res.status(422).json(errors);
        return;
    }

    var authority = req.body.authority;

    req.getConnection(function(err, conn) {

        if (err) return next("Cannot Connect");

        conn.query(
            "UPDATE `heroku_8fddb363146ffaf`.`authority` " +
            "SET `Accout_Approval` = ? " +
            "WHERE `AID` = ?; ", [authority.Accout_Approval, authority.AID],
            function(err, results, fields) {
                if (err) {
                    console.log(err);
                    return next("Mysql error, check your query at edit_authority");
                }

                res.status(200).json({ "isSuccess": true, "message": "Authority account approval has been changed." });
            });
    });

}

exports.delete_authority = function(req, res, next) {

    var authority_id = req.params.authority_id;

    req.getConnection(function(err, conn) {

        if (err) return next("Cannot Connect");

        conn.query(
            "DELETE FROM `heroku_8fddb363146ffaf`.`authority` " +
            "WHERE `AID` = ?; ", [authority_id],
            function(err, results, fields) {
                if (err) {
                    console.log(err);
                    return next("Mysql error, check your query at delete_authority");
                }

                res.status(200).json({ "isSuccess": true, "message": "Authority account has been deleted." });
            });
    });

}