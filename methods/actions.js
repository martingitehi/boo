// Profile API version 1 (v1)
// Author: Martin Gitehi

var Profile = require('../models/user');
var config = require('../config/database');
var jwt = require('jwt-simple');
var bcrypt = require('bcrypt-nodejs');
var mongoose = require('mongoose');

var functions = {
    login: function (req, res, next) {
        Profile.findOne({ username: req.body.username }, function (err, profile) {
            if (err) {
                res.json({ message: 'An error occured signing in.' });
            }

            else if (!profile) {
                return res.json({ success: false, message: 'Authentication failed. ' + req.body.username + ' not found.' });
            }

            else {
                var isMatch = bcrypt.compareSync(req.body.password, profile.password);

                if (isMatch) {
                    var token = jwt.encode(profile, config.secret);
                    return res.json({ success: true, token: token });
                }
                else {
                    return res.json({ success: false, message: 'Authentication failed. Wrong username and/or password.' });
                }
            }
        })
    },
    signup: function (req, res, next) {
        if ((!req.body.username) || (!req.body.password)) {
            return res.json({ success: false, msg: 'Enter all values' });
        }
        else {
            // find a profile in mongo with provided username
            Profile.findOne({ username: req.body.username }, function (err, profile) {
                // In case of any error, return using the done method
                if (err) {
                    res.status(500).json({ success: false, message: 'An error occured signing up.' });
                    next();
                }
                // already exists
                if (profile) {
                    res.json({ success: false, message: `Sorry '${req.body.username}' is already taken.` });
                } else {
                    let password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
                    req.body.password = password;
                    req.body.photos = [];
                    for (i = 0; i <= 10; i++) {
                        var id = Math.floor(Math.random() * (18 - 1) + 1);
                        req.body.photos.push('images/pic (' + id + ').jpg');
                    }
                    req.body.avatar_url = req.body.photos[1];
                    req.body.username = req.body.username.toLowerCase();
                    var newProfile = new Profile(req.body);

                    // save the profile
                    newProfile.save(function (err) {
                        if (err) {
                            res.status(500).json({ success: false, message: `An error occured signing up: ${err.message}` });
                        }
                        else {
                            res.status(200).json({ success: true, message: `Account creation successful for ${req.body.username}` });
                        }
                    });
                }
            });
        }
    },
    getinfo: function (req, res) {
        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
            var token = req.headers.authorization.split(' ')[1];
            var decodedtoken = jwt.decode(token, config.secret);
            return res.json({ success: true, info: decodedtoken, message: 'Hello ' + decodedtoken.fullname + '.' });
        }
        else {
            return res.json({ success: false, message: 'No headers present.' });
        }
    }
}

module.exports = functions;
