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

//Event manage
router.route("/events/:state")
    .get(authority.list_events);

router.route("/events")
    .post(authority.add_events)
    .patch(authority.edit_events);

router.route("/events/:event_id")
    .patch(authority.enable_events);

router.route("/events/:event_id")
    .delete(authority.disable_events);

//TODO - event_time have default state that set to 1
router.route("/events/:event_id/times")
    .get(authority.event_times);

router.route("/events/:event_id/times/:time_id")
    .delete(authority.disable_event_time);

router.route("/events/:event_id/times/:time_id/attendees")
    .get(authority.list_event_time_attendees);

//Game manage
router.route("/games/:state")
    .get(authority.list_games);

router.route("/games")
    .post(authority.add_games)
    .patch(authority.edit_games);

router.route("/games/:game_id")
    .patch(authority.enable_games);

router.route("/games/:game_id")
    .delete(authority.disable_games);

router.route("/games/:game_id/questions")
    .get(authority.game_questions);

router.route("/games/:game_id/questions/:question_id")
    .delete(authority.delete_game_question);

router.route("/games/:game_id/questions/:question_id/choices")
    .get(authority.answer_choices);

//All below routes requires admin authentication
router.use(authority.AuthenticationAdmin);

router.route("/authorities/:approval_status")
    .get(authority.list_authorities_account);

router.route("/authorities")
    .patch(authority.edit_authority);

router.route("/authorities/:authority_id")
    .delete(authority.delete_authority);

module.exports = router;