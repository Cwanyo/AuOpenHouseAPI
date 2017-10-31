var express = require('express'),
    path = require('path'),
    bodyParser = require('body-parser'),
    expressValidator = require('express-validator'),
    app = express(),
    port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(expressValidator());

/*MySql connection*/
var connection = require('express-myconnection'),
    mysql = require('mysql'),
    CLEARDB_DATABASE_URL = process.env.CLEARDB_DATABASE_URL;

app.use(connection(mysql, CLEARDB_DATABASE_URL, 'pool'));

//Add Routes
app.use('/api', require('./api/routes/auopenhouseRoute'));

//Start Server
var server = app.listen(port, function() {
    console.log('AuOpenHouse RESTful API server started on %s:%s', server.address().address, server.address().port);
});