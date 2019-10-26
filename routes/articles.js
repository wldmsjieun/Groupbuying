const express = require('express');
const router = express.Router();
const multer = require('multer');   // express에 multer모듈 적용 (for 파일업로드)
const upload = multer({ dest: 'picture/' }); //img를 올리기 위한 module 정의
const errorCatcher = require('../lib/async-error');

const Article = require('../models/article');
const User = require('../models/user');

// Add Route
router.get('/add', ensureAuthenticated, function(req, res){
  res.render('add_article', {
    title:'방 개설하기'
  });
});

router.post("/add",upload.single('picture'),errorCatcher(async(req,res,next) => {
  var name = req.file.filename;
  var new_post = new Article({
    room_maker : req.user._id,  // 개설자
    deadline : req.body.deadline, // 마감날짜
    category : req.body.category, // 카테고리
    item : req.body.item,         // 품목
    title : req.body.title,       // 방 제목
    members : req.body.members,   // 모집인원
    comment : req.body.comment,   // 하고싶은말
    picture_url : "picture/" + name,  // 품목사진
  });
  await new_post.save();

  res.redirect("/");
}));

// Load Edit Form
router.get('/edit/:id', ensureAuthenticated, function(req, res){
  var maker, accId;
 
  User.findById(req.params.id, function(err, user){
    accId = req.user._id;
  });
  Article.findById(req.params.id, function(err, article){
    maker = article.room_maker;
  
  
  // console.log("maker : " + maker);
  // console.log("accId : " + accId);

    if(maker != accId){
      req.flash('danger', 'Not Authorized');
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
  article.title = req.body.title;
 // article.author = req.body.author;
  article.body = req.body.body;

  let query = {_id:req.params.id}

  Article.update(query, article, function(err){
    if(err){
      console.log(err);
      return;
    } else {
      req.flash('success', 'Article Updated');
      res.redirect('/');
    }
  });
});

// Delete Article
router.delete('/:id', function(req, res){
  if(!req.user._id){
    res.status(500).send();
  }

  let query = {_id:req.params.id}

  Article.findById(req.params.id, function(err, article){
    if(article.room_maker != req.user._id){
      res.status(500).send();
    } else {
      Article.remove(query, function(err){
        if(err){
          console.log(err);
        }
        res.send('Success');
      });
    }
  });
});

// function authCheck(req, res){
//   console.log("enter authCheck");
//   Article.findById(req.params.id, function(err, article){
//     if(article.room_maker != req.user._id){
//       req.flash('danger', 'Not Authorized');
//       return res.redirect('/');
//     }else{
//       res.redirect('../articles/edit/' + article.room_maker);
//     }
//   });
// }

// Get Single Article
router.get('/:id', function(req, res){
  Article.findById(req.params.id, function(err, article){
    User.findById(article.room_maker, function(err, user){
      // console.log(req.params.id);
      // console.log(article.room_maker);
      res.render('article', {
        article:article,
        author: user.name
      });
    });
  });
  // console.log("i'm going authCheck");
  // authCheck(req, res);
});

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
