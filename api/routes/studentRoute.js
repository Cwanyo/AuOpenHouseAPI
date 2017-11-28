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

//TODO - un comment this bypass!
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
    .get(student.list_student_attended_events);

router.route("/myevents/:time_id")
    .get(student.myevent_info);

router.route("/myevents/:time_id")
    .post(student.student_join_event);

router.route("/myevents/:time_id")
    .delete(student.student_leave_event);

router.route("/events")
    .get(student.list_events);

router.route("/events/:event_id")
    .get(student.event_info);

router.route("/upgames")
    .get(student.list_upcoming_games);

router.route("/mygames")
    .get(student.list_student_played_games);

router.route("/mygames")
    .post(student.student_play_game);

router.route("/mygames/:game_id")
    .get(student.mygame_intfo);

router.route("/games/:game_id/questions")
    .get(student.game_questions);

router.route("/games/:game_id/questions/:question_id/choices")
    .get(student.answer_choices);

//TODO - have to find better ways to check the answer instead of sending the points that calc in client side
//TODO - sum the game points and put it in student entity 
router.route("/games")
    .get(student.list_games);

router.route("/games/:game_id")
    .get(student.game_info);

module.exports = router;