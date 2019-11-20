const express = require('express');
const router = express.Router();
const multer = require('multer');   // express에 multer모듈 적용 (for 파일업로드)
const upload = multer({ dest: 'picture/' }); //img를 올리기 위한 module 정의
const errorCatcher = require('../lib/async-error');

const Article = require('../models/article');
const User = require('../models/user');


//검색
router.get('/search', async(req, res, next) => {
  const searchItem = req.query.item;
  // console.log(searchItem)
  await Article.find({item : {$regex: searchItem}})
    .then((result) =>{
      console.log(result)
      typeof(result)
      // 검색 결과가 없으면 떠야하는데 이부분 일단 스킵.
      if (result != null){
        res.render('index', {data: result})
      } else {
        req.flash('danger', '검색 결과가 없습니다!');
        res.redirect("/");
      }
    }).catch((err) => {
      console.log(err);
    })
});

// Add Route
router.get('/add', ensureAuthenticated, function(req, res){
  res.render('add_article', { title:'방 개설하기' });
});

router.post("/add",upload.single('picture'),errorCatcher(async(req,res,next) => {
  var name = req.file.filename;
  var new_post = new Article({
    room_maker : req.user._id,  // 개설자
    startdate : req.body.startdate, // 시작날짜
    deadline : req.body.deadline, // 마감날짜
    category : req.body.category, // 카테고리
    item : req.body.item,         // 품목
    title : req.body.title,       // 방 제목
    members : req.body.members,   // 모집인원
    comment : req.body.comment,   // 하고싶은말
    current_member : 1,
    picture_url : "/picture/" + name,  // 품목사진
  });
  await new_post.save();

  res.redirect("/");
}));

// Load Edit Form
router.get('/edit/:id', ensureAuthenticated, function(req, res){

  Article.findById(req.params.id, function(err, article){
    if(article.room_maker != req.user._id){
      req.flash('danger', '잘못된 접근입니다!');
      return res.redirect('/');
    }
    res.render('edit_article', {
      title:'Edit Article',
      article:article
    });
  });
});

// Update Submit POST Route
router.post('/edit/:id', function(req, res){

  let article = {};
  article.deadline = req.body.deadline;
  article.category = req.body.category;
  article.item = req.body.item;
  article.title = req.body.title;
  article.members = req.body.members;
  article.comment = req.body.comment;
  article.current_member = req.body.current_member;

  let query = {_id:req.params.id}

  Article.update(query, article, function(err){
    if(err){
      console.log(err);
      return;
    } else {
      req.flash('success', '방 정보가 수정되었습니다!');
      res.redirect('/');
    }
  });
});

// Delete Article
// router.get('/delete/:id', function(req, res){
//   // if(!req.user._id){
//   //   res.status(500).send();
//   // }

//   let query = {_id:req.params.id}

//   Article.findById(req.params.id, function(err, article){
//     if(article.room_maker != req.user._id){
//       res.status(500).send();
//     } else {
//       Article.remove(query, function(err){
//         if(err){
//           console.log(err);
//         }
//         res.send('Success');
//       });
//     }
//   });
// });


// router.get('/delete/:id', errorCatcher(async(req, res, next) =>{
//   await Article.findByIdAndDelete(req.params.id);
//   res.redirect('/');
// }));

router.get('/delete/:id', errorCatcher(async(req, res, next) =>{

  Article.findById(req.params.id, function(err, article){
    if(article.room_maker != req.user._id){
      req.flash('danger', '잘못된 접근입니다!');
      return res.redirect('/');
    }
    else{
      console.log(req.params.id);
      // Article.findByIdAndDelete(req.params.id);
      article.remove();
      res.redirect('/');
    }
  });
}));

// Get Single Article
router.get('/:id', function(req, res){
  Article.findById(req.params.id, function(err, article){
    User.findById(article.room_maker, function(err, user){
      // console.log(req.params.id);
      // console.log(article.room_maker);
      // console.log(article);
      res.render('article', {
        article:article,
        author: user.name
      });
    });
  });
  // console.log("i'm going authCheck");
  // authCheck(req, res);
});

router.get('/join/:id', ensureAuthenticated, errorCatcher(async(req, res, next) =>{
  Article.findById(req.params.id, function(err, article){
    console.log("here");
    console.log(req.user._id);
    
    if(article.room_maker != req.user._id){
      let record = {};
      record.deadline = article.deadline;
      record.category = article.category;
      record.item = article.item;
      record.title = article.title;
      record.members = article.members;
      record.comment = article.comment;
      record.current_member = article.current_member + 1;
      console.log(record);
      let query = {_id:req.params.id}
      var limit_num = parseInt(article.members);
      console.log(limit_num);
      if(limit_num < record.current_member){
        req.flash('danger', '인원이 마감되었습니다!');
        res.redirect('/');
      }else{
        Article.update(query, record, function(err){
          if(err){
            console.log(err);
            return;
          } else {
            req.flash('success', '신청되었습니다!');
            res.redirect('/');
          }
        });
      }

     
    } else {
      req.flash('danger', '방 개설자는 신청 불가!');
      res.redirect('/');
    }
  })
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


module.exports = router;
