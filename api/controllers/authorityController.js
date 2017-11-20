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

exports.list_events = function(req, res, next) {

    req.getConnection(function(err, conn) {

        if (err) return next("Cannot Connect");

        var query = conn.query(
            "SELECT EID, Name, Info, Image, State, Location_Latitude, Location_Longitude, e.FID, e.MID, Faculty_Name, Major_Name, Icon " +
            "FROM heroku_8fddb363146ffaf.event AS e LEFT JOIN ( " +
            "SELECT f.fid, m.mid, f.name AS Faculty_Name, m.name AS Major_Name, Icon " +
            "FROM heroku_8fddb363146ffaf.major AS m INNER JOIN heroku_8fddb363146ffaf.faculty AS f ON m.fid = f.fid) AS fm ON e.mid = fm.mid; ",
            function(err, results, fields) {
                if (err) {
                    console.log(err);
                    return next("Mysql error, check your query");
                }

                res.status(200).json(results);
            });
    });

}