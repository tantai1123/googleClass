const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

const Class = require('../../models/Class');
const User = require('../../models/User');
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');

const validateCreateClass = require('../../validation/class');
const validatePostInput = require('../../validation/post');

const { checkObjectId } = require('../../utils/checkObjectId');
const { MyError } = require('../../utils/myError');

router.get('/class/all', passport.authenticate('jwt', { session: false }), (req, res) => {
    let result = [];
    User.findById(req.user.id)
        .then(user => {
            if (!user.isStaff) {
                return res.json({
                    statusCode: -1,
                    message: 'Bạn không có quyền',
                    data: 0
                });
            } else {
                Class.find()
                    .populate('teacher', ['name'])
                    .sort({ date: -1 })
                    .then(classes => {
                        for (const classs of classes) {
                            result.push({
                                id: classs._id,
                                name: classs.name,
                                teacher: classs.teacher,
                                description: classs.description,
                            })
                        }
                        return res.json({
                            statusCode: 1,
                            message: 'Thành công',
                            data: result
                        })
                    })
                    .catch(err => res.status(404).json({ noclass: 'Không tìm thấy nhóm nào' }));
            }
        })
});
router.post('/class/create', passport.authenticate('jwt', { session: false }), async (req, res) => {
    User.findById(req.user.id).then(async user => {
        if (!user.isStaff) {
            return res.status(402).json({
                statusCode: -1,
                message: 'Bạn không phải là Staff',
                data: 0
            });
        } else {
            const { errors, isValid } = validateCreateClass(req.body);
            if (!isValid) {
                return res.status(400).json(errors);
            }
            const newClass = new Class({
                name: req.body.name,
                // members: req.user.id,
                description: req.body.description,
                startTime: req.body.startTime,
                endTime: req.body.endTime,
                time: req.body.time
            })
            await newClass.save().then(async classs => {
                await User.findByIdAndUpdate(req.user.id, { $push: { class: classs._id } })
                return res.json({
                    statusCode: -1,
                    message: 'Tạo lớp thành công',
                    data: {
                        _id: classs._id,
                        name: classs.name,
                        description: classs.description,
                        startTime: classs.startTime,
                        endTime: classs.endTime,
                        time: classs.time
                    }
                })
            });
        }
    })
});
router.get('/class/:clId', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await User.findById(req.user.id).then(async user => {
        if (!user.isStaff) {
            return res.status(402).json({
                statusCode: -1,
                message: 'Bạn không có quyền',
                data: 0
            });
        } else {
            let result = []
            await Post.find({ class: req.params.clId })
                .sort({ _id: -1 })
                .then(posts => {
                    for (const post of posts) {
                        result.push({
                            _id: post._id,
                            class: post.class,
                            author: post.author,
                            text: post.text,
                            document: post.document,
                            comments: post.comments,
                            date: date
                        })
                    }
                    return res.json({
                        statusCode: 1,
                        message: 'Thành công',
                        data: result
                    })
                })
                .catch(err => res.json({
                    statusCode: -1,
                    message: 'Không tìm thấy bài viết nào',
                    data: 0
                }));
        }
    })
        .catch(err => res.json({
            statusCode: -1,
            message: err.message,
            data: 0
        }))
});

router.get('/class/:clId/members', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await User.findById(req.user.id).then(async user => {
        if (!user.isStaff) {
            return res.status(402).json({
                statusCode: -1,
                message: 'Bạn không có quyền',
                data: 0
            });
        } else {
            await Class.findById(req.params.clId)
                .populate('teacher', ['name', 'avatar'])
                .populate('students', ['name', 'avatar'])
                .then(classs => {
                    return res.json({
                        statusCode: 1,
                        message: 'Thành công',
                        data: {
                            students: classs.students,
                            teacher: classs.teacher,
                            members: classs.members
                        }
                    })
                })
        }
    })
        .catch(err => res.json({
            statusCode: -1,
            message: err.message,
            data: 0
        }))
});
router.get('/user/all', passport.authenticate('jwt', { session: false }), async (req, res) => {
    let result = [];
    if (req.user.isStaff) {
        await User.find()
            .sort({ gmail: -1 })
            .then(users => {
                for (const user of users) {
                    result.push({
                        id: user.id,
                        gmail: user.gmail,
                        name: user.name,
                        isTeacher: user.isTeacher,
                        isStaff: user.isStaff,
                        isAdmin: user.isAdmin,
                        classes: user.classes
                    })
                }
                return res.json({
                    statusCode: 1,
                    message: 'Danh sách người dùng',
                    data: result
                })
            })
            .catch(err => res.status(404).json({ noUser: 'Không tìm thấy người dùng nào' }));
    } else {
        return res.json({
            statusCode: -1,
            message: 'Bạn không có quyền',
            data: 0
        })
    }
});
router.get('/:clId/user/allstudents', passport.authenticate('jwt', { session: false }), async (req, res) => {
    let result = [];
    if (req.user.isStaff) {
        await User.find({ isTeacher: false, isStaff: false, isAdmin: false, classes: { $ne: req.params.clId } })
            .sort({ gmail: -1 })
            .then(users => {
                for (const user of users) {
                    result.push({
                        id: user.id,
                        gmail: user.gmail,
                        name: user.name,
                        isTeacher: user.isTeacher
                    })
                }
                return res.json({
                    statusCode: 1,
                    message: 'Danh sách sinh viên',
                    data: result
                })
            })
            .catch(err => res.status(404).json({ noUser: 'Không tìm thấy người dùng nào' }));
    } else {
        return res.json({
            statusCode: -1,
            message: 'Bạn không có quyền',
            data: 0
        })
    }
});
router.get('/:clId/user/allteachers', passport.authenticate('jwt', { session: false }), async (req, res) => {
    let result = [];
    if (req.user.isStaff) {
        await User.find({ isTeacher: true, classes: { $ne: req.params.clId } })
            .sort({ gmail: -1 })
            .then(users => {
                for (const user of users) {
                    result.push({
                        id: user.id,
                        gmail: user.gmail,
                        name: user.name,
                        isTeacher: user.isTeacher
                    })
                }
                return res.json({
                    statusCode: 1,
                    message: 'Danh sách giáo viên',
                    data: result
                })
            })
            .catch(err => res.status(404).json({ noUser: 'Không tìm thấy người dùng nào' }));
    } else {
        return res.json({
            statusCode: -1,
            message: 'Bạn không có quyền',
            data: 0
        })
    }
});
router.post('/class/:clId/addstudent/:idUser', passport.authenticate('jwt', { session: false }), async (req, res) => {
    async function addStudents(idSender, idReceiver, idStaff) {
        checkObjectId(idSender, idReceiver, idStaff)
        const staff = await User.findById(idStaff);
        if (!staff.isStaff) throw new MyError('Không có quyền', 401);
        const queryObject = {
            _id: idSender,
            classes: { $ne: idReceiver },
        }
        const sender = await User.findOneAndUpdate(queryObject, { $push: { classes: idReceiver } });
        if (!sender) throw new MyError('Sinh viên này đã ở trong lớp', 404);

        const options = {
            new: true,
            fields: { name: 1 }
        };
        const updateObject = { $push: { students: idSender, members: idSender } };
        const receiver = await Class.findByIdAndUpdate(idReceiver, updateObject, options);
        if (!receiver) throw new MyError('Không tìm thấy lớp', 404);
        return sender;
    }
    await User.findById(req.params.idUser).then(user => {
        if (user.isTeacher) {
            return res.json({
                statusCode: -1,
                message: 'người này không phải sinh viên',
                data: 0
            })
        } else {
            addStudents(req.params.idUser, req.params.clId, req.user.id)
                .then(data => res.json({
                    statusCode: 1,
                    message: 'Thêm sinh viên thành công',
                    data: {
                        id: data._id,
                        name: data.name,
                        gmail: data.gmail
                    }
                }))
                .catch(res.onError);
        }
    })
});
router.post('/class/:clId/addteacher/:idUser', passport.authenticate('jwt', { session: false }), async (req, res) => {
    async function addTeacher(idSender, idReceiver, idStaff) {
        checkObjectId(idSender, idReceiver)
        const staff = await User.findById(idStaff);
        if (!staff.isStaff) throw new MyError('Không có quyền', 401);
        const queryObject = {
            _id: idSender,
            classes: { $ne: idReceiver },
        }
        const sender = await User.findOneAndUpdate(queryObject, { $push: { classes: idReceiver } });
        if (!sender) throw new MyError('Giảng viên này đã được thêm trước đó', 404);

        const classs = await Class.findById(idReceiver);

        const options = {
            new: true,
            fields: { name: 1 }
        };
        const updateObject = {
            $set: { teacher: idSender },
            $push: { members: idSender }
        };
        await User.findByIdAndUpdate(classs.teacher, { $pull: { classes: idReceiver } });
        await Class.findByIdAndUpdate(idReceiver, { $pull: { members: classs.teacher } });
        const receiver = await Class.findByIdAndUpdate(idReceiver, updateObject, options);
        if (!receiver) throw new MyError('Không tìm thấy lớp này', 404);
        return sender;
    }
    await User.findById(req.params.idUser).then(user => {
        if (!user.isTeacher) {
            return res.json({
                statusCode: -1,
                message: 'người này không phải giảng viên',
                data: 0
            })
        } else {
            addTeacher(req.params.idUser, req.params.clId, req.user.id)
                .then(data => res.json({
                    statusCode: 1,
                    message: 'Thêm giảng viên thành công',
                    data: {
                        id: data._id,
                        name: data.name,
                        gmail: data.gmail
                    }
                }))
                .catch(res.onError);
        }
    })
});
router.post('/class/:clId/remove/:idUser', passport.authenticate('jwt', { session: false }), async (req, res) => {
    async function removeUser(idSender, idReceiver, idStaff) {
        checkObjectId(idSender, idReceiver);
        const staff = await User.findById(idStaff);
        if (!staff.isStaff) throw new MyError('Không có quyền', 401);
        const queryObject = {
            _id: idSender,
            classes: { $eq: idReceiver },
        }
        const sender = await User.findOneAndUpdate(queryObject, { $pull: { classes: idReceiver } });
        if (!sender) throw new MyError('Không tìm thấy người dùng', 404);

        const updateObject1 = {
            $pull: { members: idSender, students: idSender }
        };
        const updateObject2 = {
            $pull: { members: idSender, },
            $unset: { teacher: "" }
        };
        const classs = await Class.findById(idReceiver)
        if (classs.teacher.toString() == idSender) {
            const receiver = await Class.findByIdAndUpdate(idReceiver, updateObject2);
            if (!receiver) throw new MyError('Không tìm thấy lớp này', 404);
            return sender;
        } else {
            const receiver = await Class.findByIdAndUpdate(idReceiver, updateObject1);
            if (!receiver) throw new MyError('Không tìm thấy lớp này', 404);
            return sender;
        }
    }
    removeUser(req.params.idUser, req.params.clId, req.user.id)
        .then(data => res.send({
            success: true,
            message: 'Xóa thành công',
            data: {
                id: data._id,
                name: data.name,
            }
        }))
        .catch(res.onError);
});
router.delete('/class/:clId', passport.authenticate('jwt', { session: false }), async (req, res) => {
    async function removeClass(idClass, idStaff) {
        checkObjectId(idClass, idStaff)
        const queryObject = {
            _id: idStaff,
            isStaff: true,
        }
        const admin = await User.findOne(queryObject);
        if (!admin) throw new MyError('Không có quyền', 404);

        const classs = await Class.findByIdAndRemove(idClass);
        if (!classs) throw new MyError('Không tìm thấy lớp này', 404);
        const array = classs.members
        await array.forEach(async element => {
            await User.findByIdAndUpdate(element, { $pull: { classes: idClass } })
        });
        return classs;
    }
    removeClass(req.params.clId, req.user.id)
        .then(classs => res.send({
            success: true,
            message: 'Xóa thành công'
        }))
        .catch(res.onError);
});

router.post('/class/:clId/addstudents', passport.authenticate('jwt', { session: false }), async (req, res) => {
    async function addStudents(idSender, idStaff, data) {
        checkObjectId(idSender, idStaff)
        const staff = await User.findById(idStaff);
        if (!staff.isStaff) throw new MyError('Không có quyền', 401);
        var array = {};
        if (typeof data.idUser !== 'undefined') {
            array.idUser = (data.idUser.split(','));
        }

        const queryObject = {
            _id: idSender,
            members: { $nin: array.idUser },
            students: { $nin: array.idUser }
        };
        const options = {
            new: true,
            fields: { name: 1 }
        };
        const updateObject = { $push: { students: { $each: array.idUser }, members: { $each: array.idUser } } };
        const receiver = await Class.findOneAndUpdate(queryObject, updateObject, options);
        if (!receiver) throw new MyError('Học sinh này đã tham gia rồi', 404);
        await array.idUser.forEach(async element => {
            console.log(element);
            await User.findByIdAndUpdate(element, { $push: { classes: idSender } })
        });
        return receiver;
    }
    addStudents(req.params.clId, req.user.id, req.body)
        .then(data => res.json({
            success: true,
            message: 'Thêm sinh viên thành công',
            data: {
                id: data._id,
                name: data.name,
                gmail: data.gmail
            }
        }))
        .catch(res.onError);
});

module.exports = router;
