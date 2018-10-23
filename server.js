var express = require("express"),
    cors = require("cors"),
    bodyParser = require("body-parser"),
    expressValidator = require("express-validator"),
    cookieSession = require("cookie-session"),
    app = express(),
    port = process.env.PORT || 8080;

app.use(cors({ credentials: true, origin: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(expressValidator());

/*MySql connection*/
var connection = require("express-myconnection"),
    mysql = require("mysql"),
    CLEARDB_DATABASE_URL = process.env.CLEARDB_DATABASE_URL;

app.use(connection(mysql, CLEARDB_DATABASE_URL, "pool"));

app.set("trust proxy", 1);
app.use(cookieSession({
    secret: process.env.SECRET,
    maxAge: 60 * 60 * 1000 * 24 // <- hours session expire
}));

//Student Routes
app.use("/api/student", require("./api/routes/studentRoute"));
//Admin Routes
app.use("/api/authority", require("./api/routes/authorityRoute"));

//Start Server
var server = app.listen(port, function() {
    console.log("AuOpenHouse RESTful API server started on port :: %s", server.address().port);
});