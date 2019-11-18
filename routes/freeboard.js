//자유게시판
var express = require('express');
var router = express.Router();
const errorCatcher = require('../lib/async-error');
var User = require('../models/user');

router.post('/write', async(req, res) => {
    
})

module.exports = router;