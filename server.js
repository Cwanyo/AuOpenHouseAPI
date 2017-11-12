var express = require('express'),
    path = require('path'),
    bodyParser = require('body-parser'),
    expressValidator = require('express-validator'),
    app = express(),
    port = process.env.PORT || 8080;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(expressValidator());

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

/*MySql connection*/
var connection = require('express-myconnection'),
    mysql = require('mysql'),
    CLEARDB_DATABASE_URL = process.env.CLEARDB_DATABASE_URL;

app.use(connection(mysql, CLEARDB_DATABASE_URL, 'pool'));

//Student Routes
app.use('/api/student', require('./api/routes/studentRoute'));

//Start Server
var server = app.listen(port, function() {
    console.log('AuOpenHouse RESTful API server started on port :: %s', server.address().port);
});