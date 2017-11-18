var express = require("express"),
    path = require("path"),
    bodyParser = require("body-parser"),
    expressValidator = require("express-validator"),
    session = require("express-session"),
    app = express(),
    port = process.env.PORT || 8080;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(expressValidator());

/*MySql connection*/
var connection = require("express-myconnection"),
    mysql = require("mysql"),
    CLEARDB_DATABASE_URL = process.env.CLEARDB_DATABASE_URL;

app.use(connection(mysql, CLEARDB_DATABASE_URL, "pool"));

app.set("trust proxy", 1);
app.use(session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false
}));

//Student Routes
app.use("/api/student", require("./api/routes/studentRoute"));

//Start Server
var server = app.listen(port, function() {
    console.log("TEST!");
    console.log("AuOpenHouse RESTful API server started on port :: %s", server.address().port);
});