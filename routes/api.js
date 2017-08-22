var express = require('express');
var router = express.Router();
var Profile = require('../models/user');
var csrf = require('csurf');
var token = csrf();
var mongoose = require('mongoose');

//router.use(token);

router.get('/profiles', (req, res, next) => {
	Profile.find({}, (err, profiles) => {
		if (err) {
			res.status(500).json(err.message);
		}
		else {
			res.status(200).json(profiles);
		}
	});
});

router.get('/profiles/:id', function (req, res) {
	Profile.findById(req.params.id, function (err, profile) {
		if (err) {
			res.send(err.message);
		}
		else {
			res.json({ profile: profile });
		}
	});
});

router.post('/profiles', (req, res, next) => {
	var profile = new Profile(req.body);

	profile.save().then(function (err, cb) {
		if (err) {
			res.status(500).json({ message: err.message });
		}
		else {
			res.status(200).json(`Registration successful for ${cb.fullname}.`);
		}
	});
});

module.exports = router;