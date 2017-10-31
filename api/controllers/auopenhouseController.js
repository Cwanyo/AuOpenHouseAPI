'use strict';

exports.Authetication = function(req, res, next) {
    console.log(req.method, req.url);
    next();
}

exports.welcome_page = function(req, res, next) {
    res.send('Welcome to AuOpenHouse Api');
}

exports.list_all_users = function(req, res, next) {
    req.getConnection(function(err, conn) {

        if (err) return next("Cannot Connect");

        var query = conn.query('SELECT * FROM heroku_8fddb363146ffaf.name;', function(err, results, fields) {
            if (err) {
                console.log(err);
                return next("Mysql error, check your query");
            }
            res.json(results);
        });
    });

}