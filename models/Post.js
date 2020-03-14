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
  image: {
    type: String,
    required: false
  },
  extension: {
    type: Boolean,
    default: false
  },
  fileName: {
    type: String,
    default: 'No name'
  },
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Comment'
    }
  ]
})
module.exports = Post = mongoose.model('Post', postSchema);