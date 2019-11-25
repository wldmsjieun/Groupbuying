const mongoose = require('mongoose');

// User Schema
const UserSchema = mongoose.Schema({
  name:{
    type: String,
    required: true
  },
  email:{
    type: String,
    required: true
  },
  username:{
    type: String,
    required: true
  },
  password:{
    type: String,
    required: true
  },
  phone:{
    type: String,
    required: true
  },
  address:{
    type: String,
    required: true
  },
  mydips: [new mongoose.Schema({item_id: String})],
  item_List:[mongoose.Schema.Types.Mixed],
  item_count : {type : Number}
  
});

const User = module.exports = mongoose.model('User', UserSchema);
