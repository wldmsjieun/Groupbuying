//자유게시판
var express = require('express');
var router = express.Router();
const errorCatcher = require('../lib/async-error');
const Freeboard = require('../models/freeboard');
const User = require('../models/user');


router.get('/add',ensureAuthenticated, errorCatcher(async(req, res, next) => {
  res.render('home/add_freeboard', { title: 'add_Freeboard' });
}));
router.get('/:id', function(req, res){
  Freeboard.findById(req.params.id, function(err, freeboard){
    User.findById(freeboard.board_maker, function(err, user){
      // console.log(req.params.id);
      // console.log(article.room_maker);
      // console.log(article);
      res.render('home/freeboard', {
        freeboard:freeboard
      });
    });
  });
  // console.log("i'm going authCheck");
  // authCheck(req, res);
});
// router.get('/adds',errorCatcher(async(req,res,next) => {
//   var new_post = new Freeboard({
//     author : req.query._id,  // 개설자
//     title : req.query.title, // 제목
//     contents : req.query.contents, // 내용
//     index : 0, // 방번호
//     date : req.body.date,   // 등록날짜
//     views : 0,  // 조회수
//       });
//   await new_post.save();
//   res.redirect("/freeboard");
// }));

router.post('/adds',errorCatcher(async(req,res,next) => {
  var d=new Date();
  var date1 = d.getFullYear()+"-"+(d.getMonth()+1)+"-"+(d.getDay()+1);
  var new_post = new Freeboard({
    board_maker : req.user._id,
    author : req.user.username,  // 개설자
    title : req.body.title, // 제목
    contents : req.body.contents, // 내용
    date : date1,   // 등록날짜
    views : 0,  // 조회수
      });
  await new_post.save();
  res.redirect("/freeboard");
}));

// Access Control
function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  } else {
    req.flash('danger', '로그인이 필요합니다!');
    res.redirect('/users/login');
  }
}
// router.post('/adds', async function(req,res,next){
// console.log('hi')
//   console.log(req.body);
// })

module.exports = router;
