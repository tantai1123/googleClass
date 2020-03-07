const mongoose = require('mongoose');
const Schema  = mongoose.Schema;

const classSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  members: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  teacher:{ 
    type: Schema.Types.String, 
    ref: 'User' 
  },
  students:{ 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  },
  posts: [
    {
      type: Schema.Types.ObjectId, 
      ref: 'Post' 
    }
  ],
  description: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  }
})

module.exports = Class = mongoose.model('Class', classSchema);