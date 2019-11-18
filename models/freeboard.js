const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Freeboard Schema
var FreeboardSchema = new Schema({
    // index : { type: Number, index: true },      // 번호
    title : { type: String },                   // 제목
    contents : { type: String },                // 내용
    author : { type: String },                  // 작성자
    // date : { type: Date, default: Date.now },   // 날짜
    // views : { type: Number },                   // 조회수
},{
    toJSON:{virtuals:true},
    toObject: {virtuals:true}
});

var Freeboard = mongoose.model('Freeboard', FreeboardSchema);
module.exports = Freeboard;