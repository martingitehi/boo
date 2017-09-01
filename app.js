var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
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
var index = require('./routes/index');
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

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(cors());

app.use(session({
    secret: 'heybooboo',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    cookie: { maxAge: 360 * 60 * 1000 }
}));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//register routes
app.use('/', index);
app.use('/auth', authenticate);
app.use('/api', api);

//middleware
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());

//// Initialize Passport
require('./passport-init')(passport);
app.use(passport.session());

// app.use(function (req, res, next) {
//     res.locals.login = req.isAuthenticated();
//     res.locals.session = req.session;
//     next();
// });

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
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
