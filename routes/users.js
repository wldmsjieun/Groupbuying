const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

// Bring in User Model
let User = require('../models/user');

// Register Form
router.get('/register', function(req, res){
  res.render('register');
});

// Register Proccess
router.post('/register', function(req, res){
  const name = req.body.name;
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;
  const password2 = req.body.password2;
  const phone = req.body.phone;
  const address = req.body.address;

  req.checkBody('name', '이름을 입력하세요!').notEmpty();
  req.checkBody('email', '이메일을 입력하세요!').notEmpty();
  req.checkBody('email', '유효하지 않은 이메일입니다!').isEmail();
  req.checkBody('username', '아이디를 입력하세요.').notEmpty();
  req.checkBody('password', '비밀번호를 입력하세요.').notEmpty();
  req.checkBody('password2', '비밀번호가 일치하지 않습니다.').equals(req.body.password);
  req.checkBody('phone', '핸드폰 번호를 입력하세요.').notEmpty();
  req.checkBody('address', '주소를 입력하세요.').notEmpty();

  let errors = req.validationErrors();

  if(errors){
    res.render('register', {
      errors:errors
    });
  } else {
    let newUser = new User({
      name:name,
      email:email,
      username:username,
      password:password,
      phone:phone,
      address:address
    });

    bcrypt.genSalt(10, function(err, salt){
      bcrypt.hash(newUser.password, salt, function(err, hash){
        if(err){
          console.log(err);
        }
        newUser.password = hash;
        newUser.save(function(err){
          if(err){
            console.log(err);
            return;
          } else {
            req.flash('success','회원가입에 성공하였습니다. 로그인 해주세요.');
            res.redirect('/users/login');
          }
        });
      });
    });
  }
});

// Login Form
router.get('/login', function(req, res){
  res.render('login');
});

// Login Process
router.post('/login', function(req, res, next){
  passport.authenticate('local', {
    successRedirect:'/',
    failureRedirect:'/users/login',
    failureFlash: true
  })(req, res, next);
});

// logout
router.get('/logout', function(req, res){
  req.logout();
  req.flash('success', '로그아웃 성공!');
  res.redirect('/users/login');
});

// Load User Edit Form
router.get('/edit/:id', function(req, res){

  res.render('edit_user', {
    title:'Edit User',
    user:user
  });
  
});

// Update User Submit POST Route
router.post('/edit/:id', function(req, res){

  let user = {};
  user.name = req.body.name;
  user.email = req.body.email;
  user.phone = req.body.phone;
  user.address = req.body.address;

  let query = {_id:req.params.id}

  User.update(query, user, function(err){
    if(err){
      console.log(err);
      return;
    } else {
      req.flash('success', '회원정보가 수정되었습니다!');
      res.redirect('/');
    }
  });
});

module.exports = router;
