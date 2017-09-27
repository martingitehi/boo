// Profile API version 1 (v1)
// Author: Martin Gitehi

var Profile = require('../models/user');
var config = require('../config/database');
var jwt = require('jwt-simple');
var bcrypt = require('bcrypt-nodejs');
var mongoose = require('mongoose');

var functions = {
    login: (req, res, next) => {
        Profile.findOne({ username: req.body.username }, function (err, profile) {
            if (err) {
                res.json({ message: 'An error occured signing in.' });
            }

            else if (!profile) {
                return res.json({ success: false, message: `Authentication failed. '${req.body.username}' not found.` });
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
    signup: (req, res, next) => {
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
    remove: (req, res) => {
        Profile.remove({ _id: req.params.id }, (err) => {
            if (err) {
                return res.json({ success: false, message: err.message });
            }
            else {
                return res.json({ success: true, message: 'Account deleted successfully.' });
            }
        })
    },
    getinfo: (req, res) => {
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
