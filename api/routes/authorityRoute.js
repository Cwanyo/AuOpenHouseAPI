"use strict";

var authority = require("../controllers/authorityController");

var express = require("express");
//RESTful route
var router = express.Router();

//Welcome route
router.route("/")
    .get(authority.welcome_page);

//TODO - update account details 
router.route("/login")
    .put(authority.login);

router.route("/logout")
    .get(authority.logout);

//All below routes requires to set MYSQL time zone offset to Thailand (+07:00)
router.use(authority.SetTimeZone);

//All below routes requires user authentication
router.use(authority.Authentication);

router.route("/events")
    .get(authority.list_events);

module.exports = router;