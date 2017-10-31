'use strict';

var auopenhouse = require('../controllers/auopenhouseController');

var express = require('express');
//RESTful route
var router = express.Router();

/*------------------------------------------------------
*  This is router middleware,invoked everytime
*  we hit url /api and anything after /api
*  like /api/user , /api/user/7
*  we can use this for doing validation,authetication
*  for every route started with /api
--------------------------------------------------------*/
router.use(auopenhouse.Authetication);

//Welcome route
router.route('/')
    .get(auopenhouse.welcome_page);

//Test route
router.route('/users')
    .get(auopenhouse.list_all_users);


module.exports = router;