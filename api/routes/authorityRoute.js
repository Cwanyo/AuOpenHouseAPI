"use strict";

//TODO - check if valid JSON data

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

router.route("/request")
    .put(authority.request);

//All below routes requires to set MYSQL time zone offset to Thailand (+07:00)
router.use(authority.SetTimeZone);

router.route("/faculties")
    .get(authority.list_faculties);

router.route("/faculties/:faculty_id/majors")
    .get(authority.list_majors);

//All below routes requires staff authentication
router.use(authority.AuthenticationStaff);

router.route("/events/:state")
    .get(authority.list_events)

router.route("/events")
    .post(authority.add_events)
    .patch(authority.edit_events);

router.route("/events/:event_id")
    .delete(authority.disable_events);

//TODO - event_time have default state that set to 1
router.route("/events/:event_id/times")
    .get(authority.event_time);

router.route("/events/:event_id/times/:time_id")
    .delete(authority.disable_event_time);

//All below routes requires admin authentication
router.use(authority.AuthenticationAdmin);

router.route("/authority/:approval")
    .get(authority.list_authority_account);

router.route("/authority")
    .patch(authority.edit_authority);

module.exports = router;