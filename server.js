var express = require('express'),
    app = express(),
    port = process.env.PORT || 3000,
    mysql = require('mysql'),
    bodyParser = require('body-parser');

// mongoose instance connection url connection
/*mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/Tododb'); */


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


var routes = require('./api/routes/auopenhouseRoute'); //importing route
routes(app); //register the route


app.listen(port);