const express = require('express');
const router = express.Router();
const multer = require('multer');   // express에 multer모듈 적용 (for 파일업로드)
const upload = multer({ dest: 'picture/' }); //img를 올리기 위한 module 정의
const errorCatcher = require('../lib/async-error');

const Article = require('../models/article');
const User = require('../models/user');
var mem = new Array();
var MAXBUF = 512;
var dips = new Array();

// 자신의 찜 목록을 확인하는 부분이다.
router.get('/mydips', ensureAuthenticated, async(req,res,next) => {
  let userid = req.user._id;
  console.log(userid);
  await User.findById(userid, function(user, err){
    result = {};
    result.name = req.user.name;
    result.mydips = req.user.dips;
    console.log(result);
  }).then((result) => {
    console.log(result);
  })
})
// INDEX 정렬 창 (마감기한)
router.get('/sort_deadline', async(req, res, next) => {
  await Article.find()
    .then((result) =>{
      data_result = result;
    })
    function QuickSort(arr) { // 퀵 소트 함수이다. IF문에서 정렬하고자 하는 기준 설정(arr[i].뭐시기)
      if(arr.length == 0) {return []; }
      var middle = arr[0];
      var len = arr.length;
      var left = [], right = [];
      for(var i = 1; i < len; i++){
        if ( Number(arr[i].deadline.replace(/-/gi,'')) < Number(middle.deadline.replace(/-/gi,'')) ) {
          left.push(arr[i]);
        } else {
          right.push(arr[i]);
        }
      }
      return QuickSort(left).concat(middle, QuickSort(right));
    }
    let a = QuickSort(data_result);
  if ( a != null ){
    res.render('index', {data: a})
  } else {
    res.redirect("/");
  }
});

// INDEX 정렬 창 (최근등록)
router.get('/sort_recent_enroll', async(req, res, next) => {
  var data_result = [];
  await Article.find()
    .then((result) =>{
      data_result = result;
    })
    function QuickSort(arr) { // 퀵 소트 함수이다. IF문에서 정렬하고자 하는 기준 설정(arr[i].뭐시기)
      if(arr.length == 0)  { return []; }
      var middle = arr[0];
      var len = arr.length;
      var left = [], right = [];
      for(var i = 1; i < len; i++) {
        if ( Number(arr[i].startdate.replace(/-/gi,'')) > Number(middle.startdate.replace(/-/gi,'')) ){
          // console.log(arr[i].startdate);
          left.push(arr[i]);  // replace에서 xxxx-xx-xx 문자열에서 -를 지워줌.
        } else {
          right.push(arr[i]);
        }
      }
    return QuickSort(left).concat(middle, QuickSort(right));
  }
    let a = QuickSort(data_result);
  if ( a != null ){
    res.render('index', {data: a})
  } else {
    res.redirect("/");
  }
});
// INDEX 정렬 창 (모집인원)
router.get('/sort_pernum', async(req, res, next) => {
  var data_result = [];
  await Article.find()
    .then((result) =>{
      data_result = result;
    })
    function QuickSort(arr) {
      if(arr.length == 0) {return []; }
      var middle = arr[0];
      var len = arr.length;
      var left = [], right = [];
      for(var i = 1; i < len; i++){
        if ( Number(arr[i].members)-Number(arr[i].current_member) < Number(middle.members)-Number(middle.current_member) ) {
          left.push(arr[i]);
        } else {
          right.push(arr[i]);
        }
      }
      return QuickSort(left).concat(middle, QuickSort(right));
    }
    let a = QuickSort(data_result);
  if (a != null){
    res.render('index', {data: a})
  } else {
    res.redirect("/");
  }
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
  //article.current_member = req.body.current_member; //신청인원이라 바꿀필요 없음

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
      console.log(req.params.id);
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
        console.log(query);
        var limit_num = parseInt(article.members);
        mem = article.mem_List;
        console.log(mem);
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
  Article.findById(req.params.id, function(err, article){
    if(article.room_maker != req.user._id){
      let item_query = req.params.id
      let user_query = {_id:req.user.id} 
      const update = {
        "$addToSet": {
          "mydips": item_query
        }
      };
      const options = { 
        upsert: true,
        new: true
      };
      
      User.findOneAndUpdate(user_query, update, options)
      .then(result => {
        // console.log(user_query);
        User.findById(user_query, function(user, err){
          dips = req.user.mydips;  // 신청하기 전에 유저의 찜 목록을 배열에 저장.
          console.log("신청하기 전의 dips 배열 : " + dips);
        }).then(result => {
          for(let i=0; i<dips.length; i++){
            if (dips.indexOf(item_query) == -1){
              req.flash('success', '찜 목록에 추가되었습니다!');
              console.log("신청한 후 dips 배열 : " + dips.mydips);
              return res.redirect('/');    
            } else {
              req.flash('danger', '중복 신청입니다!');
              return res.redirect('/');    
            }
          }
        }).catch((err) => {
          console.log(err);
          req.flash('danger', 'DB err!');
          return res.redirect('/');
        })
      }).catch((err) => {
        console.log(err);
        req.flash('danger', 'DB err!');
        return res.redirect('/');
      })
    } else {
      req.flash('danger', '개설자는 찜을 할 수 없습니다!');
      return res.redirect('/');
    }
  }
)}));

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
