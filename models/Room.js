const mongoose = require('mongoose');

const  Schema  = mongoose.Schema;

const roomSchema = new Schema({
    users: [
        { 
            type: Schema.Types.ObjectId, 
            ref: 'User' 
        }
    ],
    messages: [
        {
            type: Schema.Types.ObjectId, 
            ref: 'Message' 
        }
    ]
});

module.exports = Room = mongoose.model('Room', roomSchema);

