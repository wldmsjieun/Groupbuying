const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Article Schema
var schema = Schema({
  room_maker : {type:String, required:true},//개설자
  deadline : {type:String},//모집기한
  category : {type:String},//카테고리
  item : {type:String, required:true},//품목
  title : {type:String},//방제목
  picture_url : {type:String},
  members : {type:String},
  comment : {type:String},//하고싶은 말
  current_member : {type: Number},//
  startdate: {type:String},//개설날짜
},{
  toJSON:{virtuals:true},
  toObject: {virtuals: true}
});

var Article = mongoose.model('Article', schema);
module.exports = Article;