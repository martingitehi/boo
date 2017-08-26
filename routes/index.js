var express = require('express');
var router = express.Router();
var Profile = require('../models/user');
var csrf = require('csurf');
var token = csrf();
var mongoose = require('mongoose');

//router.use(token);

/* GET home page. */
router.get('/', function (req, res) {
	Profile.find({}, (err, profiles) => {
		if (err) {
			res.send(err.message);
		}
		else {
			res.render('index', { profiles: profiles });
		}
	});	
});

router.get('/login', (req, res, next) => {
	res.render('login');
});

module.exports = router;
