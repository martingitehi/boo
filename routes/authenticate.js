var express = require('express');
var actions = require('../methods/actions');

var router = express.Router();

router.post('/login', actions.login);
router.post('/signup', actions.signup);
router.get('/getinfo', actions.getinfo);

module.exports = router;