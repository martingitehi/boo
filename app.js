var express = require('express');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var config = require('./config/database');
var passport = require('passport');
var bodyParser = require('body-parser');
var cors = require('cors');
var session = require('express-session');
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var MongoStore = require('connect-mongo')(session);
var api = require('./routes/api');
var authenticate = require('./routes/authenticate');

mongoose.connect(config.database, { useMongoClient: true });

mongoose.connection.on('open', function (err) {
    if (err) {
        return console.log(err.message);
    }
    else {
        return console.log('Boo is Connected.');
    }
});

var app = express();
//view engine setup

app.use(logger('dev'));
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//register routes
app.use('/auth', authenticate);
app.use('/api', api);

//middleware
app.use(cookieParser());
app.use(passport.initialize());

//// Initialize Passport
require('./passport-init')(passport);
app.use(passport.session());

//catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Oops! Can\'t Find That');
    err.status = 404;
    next(err);
});

//error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.json({
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.json({
        message: err.message,
        error: {}
    });
});


module.exports = app;
