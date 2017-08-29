var express = require('express');
var router = express.Router();
var Profile = require('../models/user');
var csrf = require('csurf');
//var token = csrf();
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
			res.render('profile', { profile: profile });
		}
	});
});

router.post('/profiles', (req, res, next) => {
	var profile = new Profile(req.body);

	profile.save(function (err, cb) {
		if (err) {
			return res.status(500).json({ message: err.message });
		}
		else {
			return res.json(`Registration successful for ${profile.username}.`);
		}
	});
});

router.put('/profiles/:id', (req, res, next) => {
	var id = req.params.id;
	console.log({ body: req.body, id: id });
	Profile.findOneAndUpdate({ _id: id }, req.body, (err, doc) => {
		if (err) {
			return res.json(err.message);
		}
		else {
			return res.json({ message: `Update complete for ${doc.username}`});
		}
	})
});

router.delete('/profiles/:id', (req, res, next) => {
	var id = mongoose.SchemaTypes.ObjectId(req.params.id);
	Profile.remove({ _id: id }, (err) => {
		if (err) {
			return res.json(err.message);
		}
		else {
			return res.json('Profile deleted successfully.');
		}
	})
})

module.exports = router;