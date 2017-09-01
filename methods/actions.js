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
                    res.status(401.2).json({ success: false, message: 'Sorry ' + req.body.username + ' is already taken.' });
                } else {
                    // if there is no profile, create the profile
                    req.body.photos=['images/pic (2).jpg','images/pic (5).jpg','images/pic (6).jpg'];
                    let password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
                    req.body.password = password;
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
