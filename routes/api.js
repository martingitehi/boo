var express = require('express');
var router = express.Router();
var Profile = require('../models/user');
var Chat = require('../models/chat');
var user_token = require('../methods/actions');
var csrf = require('csurf');
//var token = csrf();
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

router.get('/', function (req, res) {
	Profile.find({}, (err, profiles) => {
		if (err) {
			res.send(err.message);
		}
		else {
			res.json(profiles);
		}
	});
});

router.get('/chats', (req, res) => {
	Chat.find({}, (err, chats) => {
		if (err) {
			res.json(err.message);
		}
		else {
			res.json(chats);
		}
	});
});

router.post('/chats/:id', (req, res) => {
	Chat.find({ sender: req.body.sender }, (err, thread) => {
		if (err) {
			return res.json({ message: 'An error occured sending the message' + err.message });
		}
		if (thread.length) {
			let msgs = thread[0].messages;
			msgs.push({ content: req.body.message, sent: Date.now() });
			Chat.findByIdAndUpdate(thread[0]._id, { $set: { messages: msgs } }, (err, res) => {
				if (err) {
					return res.json({ message: 'An error occured sending the message' + err.message });
				}
				else {
					return res.json({ message: 'Message sent.' });
				}
			});
		}
		else {
			let chat = new Chat();
			chat.sender = req.body.sender;
			chat.to = req.body.sender;
			chat.messages.push(
				{
					content: req.body.message, sent: Date.now()
				}
			);
			chat.save((err) => {
				if (err) {
					return res.json({ message: 'An error occured sending the chat' + err.message });
				}
				else {
					return res.json({ message: 'Message sent.' });
				}
			});
		}
	});
});

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
			res.json(err.message);
		}
		else {
			res.json(profile);
		}
	});
});

router.put('/profile/:id/upload', (req, res) => {
	let q = req.query.avatar;
	console.log(req.query.avatar);
	// console.log(q);
	if (q == true) {
		Profile.findById(req.params.id, (err, profile) => {
			if (err) {
				return res.status(500).json({ message: 'Profile Update failed.' });
			}
			else {
				let file = req.body.image;
				profile.avatar_url = file;

				Profile.update({ _id: req.params.id }, profile, (err, cb) => {
					return res.json({ message: `Profile picture updated successfully.`, file: cb });
				});
			}
		});
	}
	else {
		Profile.findById(req.params.id, (err, profile) => {
			if (err) {
				return res.status(500).json({ message: 'Cannot find the user profile.' });
			}
			else {
				let file = req.body.image;
				profile.photos.push(file);
				Profile.update({ _id: req.params.id }, profile, (err, cb) => {
					return res.json({ message: `Upload completed successfully.`, file: cb });
				});
			}
		});
	}
});

router.put('/profiles/:id', (req, res, next) => {
	Profile.findById(req.params.id, (err, profile) => {
		if (err) {
			return res.status(500).json({ message: 'Profile update failed. Try again.' });
		}
		else {
			profile = req.body;
			Profile.findByIdAndUpdate({ _id: req.params.id }, profile, (err, body) => {
				if (err) {
					return res.status(500).json(err.message);
				}
				else {
					console.log(profile);
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
			return res.json({ message: 'Profile deleted successfully.' });
		}
	})
})

module.exports = router;