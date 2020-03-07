const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//tạo Schema
const commentSchema = new Schema({
//bình luận
    author: {
      type: Schema.Types.String,
      ref:'User'
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    text: {
      type: String,
      require: true
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post'
    },
    date: {
      type: Date,
      default: Date.now
    }
  })
  module.exports = Comment = mongoose.model('Comment', commentSchema);