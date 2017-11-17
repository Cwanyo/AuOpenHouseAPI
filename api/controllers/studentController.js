'use strict';

/*Initialize Firebase*/
var admin = require("firebase-admin"),
    serviceAccount = {
        "type": process.env.FIREBASE_TYPE,
        "project_id": process.env.FIREBASE_PROJECT_ID,
        "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
        "private_key": process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        "client_email": process.env.FIREBASE_CLIENT_EMAIL,
        "client_id": process.env.FIREBASE_CLIENT_ID,
        "auth_uri": process.env.FIREBASE_AUTH_URI,
        "token_uri": process.env.FIREBASE_TOKEN_URI,
        "auth_provider_x509_cert_url": process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
        "client_x509_cert_url": process.env.FIREBASE_CLIENT_X509_CERT_URL
    };

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://auopenhouse-wvn.firebaseio.com"
});

exports.Authentication = function(req, res, next) {
    if (req.session.sid) {
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
    res.send("Welcome to AuOpenHouse-Student Api");
}

exports.login = function(req, res, next) {

    //validation
    req.assert("idToken", "idToken is required").notEmpty();

    var errors = req.validationErrors();
    if (errors) {
        res.status(422).json(errors);
        return;
    }

    admin.auth().verifyIdToken(req.body.idToken)
        .then(function(decodedToken) {
            var data = {
                sid: decodedToken.uid,
                name: decodedToken.name,
                image: decodedToken.picture,
                email: decodedToken.email
            };

            req.getConnection(function(err, conn) {

                if (err) return next("Cannot Connect");

                var query = conn.query(
                    "INSERT INTO `heroku_8fddb363146ffaf`.`student` (`SID`, `Name`, `Image`, `Email`) " +
                    "VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE Name = ?, Image = ?, Email = ?; ", [data.sid, data.name, data.image, data.email, data.name, data.image, data.email],
                    function(err, results, fields) {
                        if (err) {
                            console.log(err);
                            return next("Mysql error, check your query");
                        }

                        //Regenerate session
                        req.session.regenerate(function() {
                            req.session.sid = data.sid;
                            res.status(200).json({ "isSuccess": true, "message": "Authentication Passed" });
                        });
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

exports.list_student_attend_events = function(req, res, next) {

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

exports.student_join_event = function(req, res, next) {

    var event_time = req.params.event_time;

    var sid = req.session.sid;

    req.getConnection(function(err, conn) {

        if (err) return next("Cannot Connect");

        var query = conn.query(
            "INSERT INTO `heroku_8fddb363146ffaf`.`student_attend_event_time` (`SID`, `TID`) " +
            "VALUES (?, ?); ", [sid, event_time],
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