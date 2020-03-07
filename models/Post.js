const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const postSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  author: {
    type: Schema.Types.String,
    ref: "User"
  },
  class: {
    type: Schema.Types.ObjectId,
    ref: "Class",
    default: null
  },
  text: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  document: {
    type: String,
    required: false
  },
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Comment'
    }
  ]
})
module.exports = Post = mongoose.model('Post', postSchema);