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
/* GET grocery page */
router.get('/grocery', errorCatcher (async(req, res, next) => {
    var category = await Article.find({category:'식자재'});
    res.render('category/grocery', {title:'foods',articles: category});
}));
//검색
router.get('/search/:item', errorCatcher (async(req, res, next) => {
  const searchItem = req.quary.item;
  const item = await Article.find({item:`${searchItem}`});
  res.render('category/grocery', {title:'foods',articles: item});
}));
/* GET home page. */
router.get('/home', errorCatcher(async(req, res, next) => {
    res.render('/', { title: 'YouAloneLive' });
  }));

  
/* GET Mypage page. */
router.get('/mypage', ensureAuthenticated, errorCatcher(async(req, res, next) => {
  res.render('home/mypage', { title: 'MyPage' });
}));
/* GET Freeboard page. */
router.get('/freeboard', errorCatcher(async(req, res, next) => {
  res.render('home/freeboard', { title: 'Freeboard' });
}));
/* GET Basket page. */
router.get('/basket', errorCatcher(async(req, res, next) => {
  res.render('home/basket', { title: 'Basket' });
}));
router.get('/dips', errorCatcher(async(req, res, next) => {
  res.render('home/dips', { title: 'Dips' });
}));


   
// Access Control
function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  } else {
    req.flash('danger', 'Please login');
    res.redirect('/users/login');
  }
}

module.exports = router;
