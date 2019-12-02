const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Freeboard Schema
var schema =  Schema({
    board_maker:{type:String, required:true},
    title : { type: String},                   // 제목
    contents : { type: String },                // 내용
    author : { type: String },                  // 작성자
     date : { type: String},//, default: Date.now },   // 날짜
    views : { type: Number, default: 0 },                   // 조회수
},{
    toJSON:{virtuals:true},
    toObject: {virtuals:true}
});

var Freeboard = mongoose.model('Freeboard', schema);
module.exports = Freeboard;
