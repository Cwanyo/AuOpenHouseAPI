"use strict";

var student = require("../controllers/studentController");

var express = require("express");
//RESTful route
var router = express.Router();

//Welcome route
router.route("/")
    .get(student.welcome_page);

router.route("/login")
    .put(student.login);

router.route("/logout")
    .get(student.logout);

//All below routes requires to set MYSQL time zone offset to Thailand (+07:00)
router.use(student.SetTimeZone);

//All below routes requires user authentication
router.use(student.Authentication);

router.route("/faculties")
    .get(student.list_faculties);

router.route("/faculties/:faculty_id")
    .get(student.faculty_info);

router.route("/faculties/:faculty_id/majors")
    .get(student.list_majors);

router.route("/faculties/:faculty_id/majors/:major_id")
    .get(student.major_info);

router.route("/upevents")
    .get(student.list_upcoming_events);

router.route("/myevents")
    .get(student.list_student_attend_events);

router.route("/myevents/:event_time/join")
    .post(student.student_join_event);

router.route("/events")
    .get(student.list_events);

router.route("/events/:event_id")
    .get(student.event_info);

router.route("/upgames")
    .get(student.list_upcoming_games);

router.route("/mygames")
    .get(student.list_student_play_games);

module.exports = router;