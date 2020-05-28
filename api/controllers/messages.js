const express = require('express');
const router = express.Router();
const passport = require('passport');

const User = require('../../models/User');
const Room = require('../../models/Room');
const { Message } = require('../../models/Message');
//Config
const { MyError } = require('../../utils/myError');
const { checkObjectId } = require('../../utils/checkObjectId');

router.use(passport.authenticate('jwt', { session: false }));

//@route POST api/messages/room
//@desc POST room
router.post('/room', (req, res) => {
    function getMatch(a, b) {
        var matches = [];
        for (var i = 0; i < a.length; i++) {
            for (var e = 0; e < b.length; e++) {
                if (a[i]._id.toString() === b[e]._id.toString()) matches.push(a[i]);
            }
        }
        console.log(matches);
        return matches;
    }
    async function createRoom(idUser, idFriend) {
        checkObjectId(idUser, idFriend);
        const user = await User.findById(idUser).populate('rooms', ['_id']);
        const friend = await User.findById(idFriend).populate('rooms', ['_id']);
        const room = getMatch(user.rooms, friend.rooms);
        if (room.length !== 0) {
            return Room.findById(room[0]._id);
        } else {
            const room = new Room({ users: [idUser, idFriend] });
            await User.findByIdAndUpdate(idUser, { $push: { rooms: room._id } });
            await User.findByIdAndUpdate(idFriend, { $push: { rooms: room._id } });
            return room.save();
        }
    }

    createRoom(req.user.id, req.body.id)
        .then(room => res.send({ success: true, data: room }))
        .catch(res.onError);
});

//@route GET api/messages/room
//@desc Get room users
router.get('/room', (req, res) => {
    async function getAllRoom(idUser) {
        const room = await User.findById(idUser)
            .select('rooms')
            .populate({
                path: 'rooms',
                select: 'users',
                populate: {
                    path: 'users',
                    select: 'avatar name',
                    match: { _id: { $ne: idUser } },
                }
            });
        if (!room) throw new MyError('User not found', 404);
        return room;
    }
    getAllRoom(req.user.id)
        .then(room => res.send({ success: true, data: room }))
        .catch(res.onError);
});

//@route GET api/messages/room/:id
//@desc Get room users
router.get('/room/:id', (req, res) => {
    async function joinRoom(idRoom) {
        const room = await Room.findById(idRoom)
            .populate({
                path: 'messages',
                populate: {
                    path: 'user',
                    select: 'avatar name'
                }
            });
        if (!room) throw new MyError('Room not found', 404);
        return room;
    }
    joinRoom(req.params.id)
        .then(room => res.send({ success: true, data: room }))
        .catch(res.onError);
});

//@route Post api/messages
//@desc Post messages
router.post('/', (req, res) => {
    async function postMessage(idRoom, message, idUser) {
        if (!message) throw new MyError('Content must be provided', 400);
        const newMessage = new Message({ message, user: idUser, room: idRoom });
        await Room.findByIdAndUpdate(idRoom, { $push: { messages: newMessage._id } });
        const data = await newMessage.save();
        const user = await User.findById(data.user)
            .select('name avatar');
        return { user: user, message, idRoom, _id: data._id };
    }
    postMessage(req.body.idRoom, req.body.message, req.user.id)
        .then(room => res.send({ success: true, data: room }))
        .catch(res.onError);
});

module.exports = router;
