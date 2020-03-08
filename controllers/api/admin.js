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

router.get('/class', passport.authenticate('jwt', { session: false }), (req, res) => {
    let result = [];
    User.findById(req.user.id).then(user => {
        if (!user.isAdmin) {
            return res.json({
                statusCode: -1,
                message: 'Bạn không có quyền',
                data: 0
            });
        } else {
            Class.find()
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
        if (!user.isAdmin) {
            return res.status(402).json({
                statusCode: -1,
                message: 'Bạn không phải là giảng viên',
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
    await User.findById(req.params.id).then(async user => {
        if (!user.isAdmin) {
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
        if (!user.isAdmin) {
            return res.status(402).json({
                statusCode: -1,
                message: 'Bạn không có quyền',
                data: 0
            });
        } else {
            await Class.findById(req.params.clId).then(classs => {
                return res.json({
                    statusCode: 1,
                    message: 'Thành công',
                    data: {
                        students: classs.students,
                        teacher: classs.teacher,
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
    if (req.user.isAdmin) {
        await User.find()
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
router.get('/all', passport.authenticate('jwt', { session: false }), async (req, res) => {
    if (req.user.isAdmin) {
      await Profile.find()
        .populate('user', ['name', 'avatar'])
        .then(profiles => {
          if (!profiles) {
            return res.status(404).json({
              statusCode: -1,
              message: 'Không tìm thấy thông tin người dùng nào',
              data: 0
            });
          }
          res.json({
            statusCode: 1,
            message: 'Lấy thông tin thành công',
            data: profiles
          });
        })
        .catch(err => res.status(404).json({ profiles: 'Không có profile nào' }));
    }
    else {
      res.json({
        statusCode: -1,
        message: 'Bạn không có quyền truy cập',
        data: 0
      })
    }
  });
router.post('/class/:clId/addstudent/:idUser', passport.authenticate('jwt', { session: false }), async (req, res) => {
    async function addStudents(idSender, idReceiver) {
        checkObjectId(idSender, idReceiver)
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
        const updateObject = { $push: { students: idSender } };
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
            addStudents(req.params.idUser, req.params.clId)
                .then(data => res.json({
                    statusCode: 1,
                    message: 'Thêm sinh viên thành công',
                    data: {
                        id: data._id,
                        name: data.name,
                        gmail: data.gmail
                    }
                }))
                .catch(err => res.json({
                    statusCode: -1,
                    message: err.message,
                    data: 0
                }));
        }
    })

});
router.post('/class/:clId/addteacher/:idUser', passport.authenticate('jwt', { session: false }), async (req, res) => {
    async function addTeacher(idSender, idReceiver) {
        checkObjectId(idSender, idReceiver)
        const queryObject = {
            _id: idSender,
            classes: { $ne: idReceiver },
        }
        const sender = await User.findOneAndUpdate(queryObject, { $push: { classes: idReceiver } });
        if (!sender) throw new MyError('Giảng viên này đã được thêm', 404);

        const options = {
            new: true,
            fields: { name: 1 }
        };
        const updateObject = { $push: { teacher: idSender } };
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
            addTeacher(req.params.idUser, req.params.clId)
                .then(data => res.json({
                    statusCode: 1,
                    message: 'Thêm giảng viên thành công',
                    data: {
                        id: data._id,
                        name: data.name,
                        gmail: data.gmail
                    }
                }))
                .catch(err => res.json({
                    statusCode: -1,
                    message: err.message,
                    data: 0
                }));
        }
    })
});
module.exports = router;