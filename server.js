var express = require('express'),
    path = require('path'),
    mysql = require('mysql'),
    bodyParser = require('body-parser'),
    expressValidator = require('express-validator'),
    app = express(),
    port = process.env.PORT || 3000;


app.set('views', './views');
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(expressValidator());

app.use(

    connection(mysql, process.env.CLEARDB_DATABASE_URL, 'request')

);

app.get('/', function(req, res) {
    res.send('Welcome');
});


//RESTful route
var router = express.Router();

/*------------------------------------------------------
*  This is router middleware,invoked everytime
*  we hit url /api and anything after /api
*  like /api/user , /api/user/7
*  we can use this for doing validation,authetication
*  for every route started with /api
--------------------------------------------------------*/
router.use(function(req, res, next) {
    console.log(req.method, req.url);
    next();
});

var curut = router.route('/user');

curut.get(function(req, res, next) {

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

});


//start Server
var server = app.listen(port, function() {

    console.log('AuOpenHouse RESTful API server started on: %s', server.address().port);

});