const express = require('express');
const router = express.Router();
const errorCatcher = require('../lib/async-error');

// Article Model // User Model
const Article = require('../models/article');
const User = require('../models/user');

// Add Route
router.get('/', errorCatcher (async(req, res,next) => {
    var articles = await Article.find();
    res.render('index', {title:'Articles',articles: articles});
}));

module.exports = router;
