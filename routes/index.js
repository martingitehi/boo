var express = require('express');
var router = express.Router();
var Profile = require('../models/user');
var csrf = require('csurf');
var token = csrf();
var mongoose = require('mongoose');

//router.use(token);

/* GET home page. */
router.get('/', function (req, res) {
	// Profile.findById(req.params.id, function (err, profile) {
	// 	if (err) {
	// 		res.send(err.message);
	// 	}
	// 	else {
	// 		res.json({profile:profile});
	// 	}
	// });
	res.render('index');
});

module.exports = router;
