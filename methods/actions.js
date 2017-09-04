var Profile = require('../models/user');
var config = require('../config/database');
var jwt = require('jwt-simple');
var bcrypt = require('bcrypt-nodejs');

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
                    return res.json({ success: false, message: 'Authentication failed. Wrong password.' });
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
                    console.log('Error in SignUp: ' + err);
                    res.status(500).json({ success: false, message: 'An error occured signing up.' });
                    next();
                }
                // already exists
                if (profile) {
                    console.log('Profile already exists with username: ' + req.body.username);
                    res.json({ success: false, message: 'Sorry ' + req.body.username + ' is already taken.' });
                } else {
                    // if there is no profile, create the profile
                    let fnames = ['Ken', 'Tini', 'Joseph', 'Alice', 'Bob', 'Regina', 'George', 'Barnice', 'Renata', 'Kevo', 'Lisa', 'Adam'];
                    let lnames = ['Ken', 'Linda', 'Joseph', 'Maggie', 'Bob', 'Regina', 'Paulina', 'Barnice', 'Odhiambo', 'Ignacio', 'Lisa', 'Adam'];
                    let password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
                    req.body.password = password;
                    req.body.photos = [];
                    for (i = 0; i <= 5; i++) {
                        var id = Math.floor(Math.random() * (99 - 1) + 1);
                        req.body.photos.push('images/pic (' + id + ').jpg');
                    }

                    let fname = fnames[Math.floor(Math.random() * (fnames.length - 1) + 1)];
                    let lname = lnames[Math.floor(Math.random() * (lnames.length - 1) + 1)];
                    req.body.fullname = fname + ' ' + lname;
                    req.body.username = `${fname}_${lname}`.toLowerCase();
                    req.body.avatar_url = req.body.photos[0];
                    console.log(req.body.fullname);
                    console.log(req.body.username);
                    var newProfile = new Profile(req.body);

                    // save the profile
                    newProfile.save(function (err) {
                        if (err) {
                            console.log('Error in SignUp: ' + err.message);
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
