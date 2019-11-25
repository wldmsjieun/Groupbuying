const express = require('express');
const router = express.Router();
const multer = require('multer');   // express에 multer모듈 적용 (for 파일업로드)
const upload = multer({ dest: 'picture/' }); //img를 올리기 위한 module 정의
const errorCatcher = require('../lib/async-error');

const Article = require('../models/article');
const User = require('../models/user');
var mem = new Array();
var MAXBUF = 512;
var basket = new Array();
// INDEX 정렬 창 (마감기한)
router.get('/sortpage', async(req, res, next) => {
  await Article.find().sort({deadline : 1})
    .then((result) =>{
      console.log(result)
      typeof(result)
      if (result != null){
        res.render('index', {data: result})
      } else {
        res.redirect("/");
      }
    }).catch((err) => {
      console.log(err);
    })
});
// INDEX 정렬 창 (최근등록)
router.get('/sortpage1', async(req, res, next) => {
  await Article.find().sort({startdate : 1})
    .then((result) =>{
      console.log(result)
      typeof(result)
      if (result != null){
        res.render('index', {data: result})
      } else {
        res.redirect("/");
      }
    }).catch((err) => {
      console.log(err);
    })
});
// INDEX 정렬 창 (모집인원)
router.get('/sortpage2', async(req, res, next) => {
  await Article.find().sort({member : 1})
    .then((result) =>{
      console.log(result)
      typeof(result)
      if (result != null){
        res.render('index', {data: result})
      } else {
        res.redirect("/");
      }
    }).catch((err) => {
      console.log(err);
    })
});

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
  var uid =req.user._id;
  var new_post = new Article({
    room_maker : uid,  // 개설자
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
  
  mem[0] = req.user._id;
  new_post.mem_List = mem[0];
  console.log(mem);
  console.log(new_post.mem_List);
  console.log(typeof(mem));
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


router.get('/delete/:id', errorCatcher(async(req, res, next) =>{

  Article.findById(req.params.id, function(err, article){
    if(article.room_maker != req.user._id){
      req.flash('danger', '잘못된 접근입니다!');
      return res.redirect('/');
    }
    else{
      console.log(req.params.id);
      article.remove();
      res.redirect('/');
    }
  });
}));

// Get Single Article
router.get('/:id', function(req, res){
  Article.findById(req.params.id, function(err, article){
    User.findById(article.room_maker, function(err, user){
    
      res.render('article', {
        article:article,
        author: user.name
      });
    });
  });

});

// 신청하기 버튼을 눌렀을 때. 파라메터는 article._id가 넘어옴.
router.get('/join/:id',upload.single('picture'), ensureAuthenticated, errorCatcher(async(req, res, next) =>{
  
  // User.findById(req.params.id, function(err, joinUser){
  //   console.log("joinUser req.params.id");
  //   console.log(req.params.id);
  

    Article.findById(req.params.id, function(err, article){
      
      if(article.room_maker != req.user._id){
        let record = {};
        record.deadline = article.deadline;
        record.category = article.category;
        record.item = article.item;
        record.title = article.title;
        record.members = article.members;
        record.comment = article.comment;
        record.current_member = article.current_member+1;
      

        let query = {_id:req.params.id}
        var limit_num = parseInt(article.members);
        mem = article.mem_List;
      
        var index = article.current_member;
      
        var str =  new String();

        for(var i=0; i < index; i++){
          console.log(mem.indexOf(req.user._id));
          
          if(mem.indexOf(req.user._id) == -1){
            mem[index] = req.user._id;
            console.log("article req.params.id");
            // console.log(req.params.id);
            // joinUser.basket.push(req.params.id);
            // basket.push(req.params.id);
            break;
          }else{
            req.flash('danger', '이미 신청하신 상품입니다!');
            return res.redirect('/');
          }
        }


        if(limit_num < record.current_member){
          req.flash('danger', '인원이 마감되었습니다!');
          res.redirect('/');
        }else{
        
          record.mem_List = mem;
          
          console.log("///////////////////////////////////");
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
        req.flash('danger', '방 개설자는 신청할 수 없습니다.');
        res.redirect('/');
      }
    })

  // })
}));

// 찜 버튼이 눌렸을 때. 마찬가지로 article._id가 넘어옴.
router.get('/dips/:id', ensureAuthenticated, errorCatcher(async(req, res, next) => {
  let query = {_id:req.params.id}
  // console.log("아이템 아이디: " + query._id);
  
  Article.findById(req.params._id, function(err, article, user){
    // console.log("here");
    // console.log("유저 아이디: " + req.user._id);
    let result = [];
    result.mydips = query;
    User.update(query, result, function(err){
      if(err){
        console.log(err);
        return;
      } else {
        this.mydips = result;
        req.flash('success', '찜 목록에 추가되었습니다!');
        res.redirect('/');
      }
    })
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
