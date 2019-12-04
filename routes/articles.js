const express = require('express');
const router = express.Router();
const multer = require('multer');   // express에 multer모듈 적용 (for 파일업로드)
const upload = multer({ dest: 'picture/' }); //img를 올리기 위한 module 정의
const errorCatcher = require('../lib/async-error');

const Article = require('../models/article');
const User = require('../models/user');
var mem = new Array();
var item_index = 0;
var basket;
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
  await Article.find({item : {$regex: searchItem}})
    .then((result) =>{
      console.log(result);
      typeof(result);
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

router.get('/deletedips/:id', ensureAuthenticated, errorCatcher(async(req, res, next) => {
  var my_dips = await User.findOne({mydips : req.user.mydips});
  let dips = {};
  dips.mydips = my_dips.mydips;

  let item_query = req.params.id;
  let user_query = {_id:req.user.id};
  for (var i = 0; i < dips.mydips.length; i++){
    var i = dips.mydips.indexOf(item_query);
    if ( i != -1 ){
      dips.mydips[i] = null;
      User.update(user_query, dips, function(err){
        if(err){
          console.log(err);
          return;
        }
        req.flash('success', '해당 상품이 찜 목록에서 삭제 되었습니다!');
        return res.redirect('/');
      });
      break;
    } else {
      req.flash('danger', '해당 상품이 찜 목록에 없습니다!');
      return res.redirect('/');
    }
  }
}));

router.get('/cancle/:id', errorCatcher(async(req, res, next) =>{
  var my_basket = await User.findOne({item_List : req.user.item_List});
  let my_info = {};
  my_info.item_List = my_basket.item_List;
 
  let item_query = req.params.id
  let user_query = {_id:req.user._id};
  for(var i=0; i < my_info.item_List.length; i++){
    //중복이면
    var i = my_info.item_List.indexOf(item_query) ;
    var article = await Article.findById(item_query);
    if(i != -1){
      my_info.item_List[i] = null;
      article.current_member = article.current_member -1;
      var mem_index = article.mem_List.indexOf(req.user._id);
      if(mem_index != -1){
        article.mem_List[mem_index] = null;
      }
      let query = {_id:req.params.id}
      User.update(user_query, my_info, function(err){
        if(err){
          console.log(err);
          return;
        }
        req.flash('success', '해당 상품이 같이 살까 목록에서 취소되었습니다!');
        return res.redirect('/');
      });
      Article.update(query, article, function(err){
        if(err){
          console.log(err);
          return;
        }
        return;
      });
      break;
    }else{
      req.flash('danger', '이미 취소하신 상품입니다!');
      return res.redirect('/');
    }
  }
}));

// 자신의 찜 목록을 확인하는 부분이다.
router.get('/mydips', ensureAuthenticated, async(req,res,next) => {
  let userid = req.user._id;
  // console.log("현 유저의 아이디 : " + userid);
  // 현 유저의 아이디로 찜 한 목록의 배열을 가지고온다.
  User.findById(userid, function(user, err){
  }).then((record) => {
    let query = {};
    query = record.mydips;
    Article.find({_id: query}, function(err,article){
    }).then((result) => {
      res.render('home/mydips', {data: result})
    }).catch((err) => {
      console.log(err);
    })
  })
  
});

// 자신의 신청 목록을 확인하는 부분이다.
router.get('/basket', ensureAuthenticated, async(req,res,next) => {
  let userid = req.user._id;
  User.findById(userid, function(user, err){
  }).then((record) => {
    let query = {};
    query = record.item_List;
    Article.find({_id: query}, function(err,article){
    }).then((result) => {
      res.render('home/basket', {data: result})
    }).catch((err) => {
      console.log(err);
    })
  })
  
})

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
  var joinmem = await User.findOne({item_List : req.user.item_List});
    Article.findById(req.params.id, function(err, article){

      let info = {};
      info.item_List = joinmem.item_List;
    
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
        var index = article.current_member;
        
        mem = article.mem_List;

        basket =joinmem.item_List;
       
        let user_query = {_id:req.user._id};
       
        for(var i=0; i < index; i++){
          //중복이 없으면
          if(mem.indexOf(req.user._id) == -1){
            // mem[index]의 user._id삽입
            mem[index] = req.user._id;
            basket[item_index] = req.params.id;
            item_index++;
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
          // info.item_List = basket;
            Article.update(query, record, function(err){
              if(err){
                console.log(err);
                return;
              } else {
                req.flash('success', '신청되었습니다!');
                res.redirect('/');
              }
            });
            User.update(user_query, info, function(err){
              if(err){
                console.log(err);
                return;
              }
            });
        }
      } else {
        req.flash('danger', '방 개설자는 신청할 수 없습니다.');
        res.redirect('/');
      }
    })
  // });
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
        // console.log(result);
        User.findById(user_query, function(user, err){
          dips = req.user.mydips;  // 신청하기 전에 유저의 찜 목록을 배열에 저장.
          // console.log("신청하기 전의 dips 배열 : " + dips);
        }).then(result => {
          for(let i=0; i<dips.length; i++){
            if (dips.indexOf(item_query) == -1){
              req.flash('success', '찜 목록에 추가되었습니다!');
              // console.log("신청한 후 dips 배열 : " + dips);
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
