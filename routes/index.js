const express = require('express');
const router = express.Router();
const errorCatcher = require('../lib/async-error');

// Article Model // User Model
const Article = require('../models/article');
const User = require('../models/user');

// Add Route
router.get('/', errorCatcher (async(req, res,next) => {
    var articles = await Article.find();
    res.render('index', {title:'너 혼자 산다',articles: articles});
}));
/* GET grocery page */
router.get('/grocery', errorCatcher (async(req, res, next) => {
    var category = await Article.find({category:'식자재'});
    res.render('category/grocery', {title:'너 혼자 산다 - 식자재',articles: category});
}));
/* GET instant page */
router.get('/instant', errorCatcher (async(req, res, next) => {
  var category = await Article.find({category:'즉석식품'});
  res.render('category/instant', {title:'너 혼자 산다 - 즉석식품',articles: category});
}));
/* GET sidedish page */
router.get('/sidedish', errorCatcher (async(req, res, next) => {
  var category = await Article.find({category:'반찬'});
  res.render('category/sidedish', {title:'너 혼자 산다 - 반찬',articles: category});
}));
/* GET drinkNIcecream page */
router.get('/drinkNIcecream', errorCatcher (async(req, res, next) => {
  var category = await Article.find({category:'음료수/아이스크림'});
  res.render('category/drinkNIcecream', {title:'너 혼자 산다 - 음료수/아이스크림',articles: category});
}));
/* GET coffeeNTea page */
router.get('/coffeeNTea', errorCatcher (async(req, res, next) => {
  var category = await Article.find({category:'커피/차'});
  res.render('category/coffeeNTea', {title:'너 혼자 산다 - 커피/차',articles: category});
}));
/* GET overseas page */
router.get('/overseas', errorCatcher (async(req, res, next) => {
  var category = await Article.find({category:'해외직구'});
  res.render('category/overseas', {title:'너 혼자 산다 - 해외직구',articles: category});
}));
/* GET etc page */
router.get('/etc', errorCatcher (async(req, res, next) => {
  var category = await Article.find({category:'기타'});
  res.render('category/etc', {title:'너 혼자 산다 - 기타',articles: category});
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
