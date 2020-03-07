const mongoose = require('mongoose');
//Khai báo hàm Schema của mongoose ở trên
const Schema  = mongoose.Schema;
//Khởi tạo userSchema 
const userSchema = new Schema({
    gmail: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    isTeacher: {
        type: Boolean,
        default: false
    },
    isVerify: {
        type: Boolean
    },
    avatar: {
        type:String
    },
    posts: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Post'
        }
    ],
    classes: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Class'
        }
    ],
    rooms: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Room'
        }
    ],
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpires: {
        type: String
    }
});
//Khởi tạo model User qua userSchema và gán biến const User
module.exports = User = mongoose.model('User', userSchema);