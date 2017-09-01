var express = require('express');
var router = express.Router();
var Profile = require('../models/user');
var csrf = require('csurf');
//var token = csrf();
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

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
			res.render('profile', { profile: profile });
		}
	});
});

router.put('/profiles/:id', (req, res, next) => {
	Profile.findById(req.params.id, (err, profile) => {
		if (err) {
			return res.status(500).json({ message: 'Profile update failed. Try again.' });
		}
		else {
			profile = req.body;
			Profile.findByIdAndUpdate({_id:req.params.id}, profile, (err, body) => {
				if (err) {
					return res.status(500).json(err.message);
				}
				else {
					console.log(body);
					return res.json(`Update complete for ${profile.username}`);
				}
			});
		}
	});
});

router.delete('/profiles/:id', (req, res, next) => {
	Profile.remove({ _id: req.params.id }, (err) => {
		if (err) {
			return res.json(err.message);
		}
		else {
			return res.json({ message: 'Profile deleted successfully.', docs_left: Profile.count });
		}
	})
})

module.exports = router;