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

router.route("/faculties")
    .get(authority.list_faculties);

router.route("/faculties/:faculty_id")
    .get(authority.faculty_info);

router.route("/faculties/:faculty_id/majors")
    .get(authority.list_majors);

router.route("/faculties/:faculty_id/majors/:major_id")
    .get(authority.major_info);

router.route("/upevents")
    .get(authority.list_upcoming_events);

router.route("/myevents")
    .get(authority.list_authority_attended_events);

router.route("/myevents/:time_id/join")
    .post(authority.authority_join_event);

router.route("/events")
    .get(authority.list_events);

router.route("/events/:event_id")
    .get(authority.event_info);

//TODO - don't display the game that already played
router.route("/upgames")
    .get(authority.list_upcoming_games);

router.route("/mygames")
    .get(authority.list_authority_played_games);

//TODO - have to find better ways to check the answer instead of sending the points that calc in client side
//TODO - sum the game points and put it in authority entity 
router.route("/mygames/:game_id/play")
    .post(authority.authority_play_game);

router.route("/games")
    .get(authority.list_games);

router.route("/games/:game_id")
    .get(authority.game_info);

router.route("/games/:game_id/questions")
    .get(authority.game_questions);

module.exports = router;