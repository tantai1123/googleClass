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
              teacher: classs.teacher,
            }
          })
        });
      }
    })
  });
router.get('/class/:clId', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await User.findById(req.params.id).then(user => {
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
                            comments: post.comments
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
    await User.findById(req.params.id).then(async user => {
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
router.get('/user/all', password.authenticate('jwt', { session: false }), async (req, res) => {
    let result = [];
    if (req.user.isAdmin) {
        await User.find()
            .sort({ gmail : -1 })
            .then(users => {
                for (const user of users) {
                    result.push({
                        gmail: user.gmail,
                        name: user.name,
                        role: user.isTeacher
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
router.post('/class/:clId/add/:idUser', passport.authenticate('jwt', { session: false }), async (req, res) => {
    async function addStudents(idSender, idReceiver) {
        checkObjectId(idSender, idReceiver)
        const queryObject = {
            _id: idSender,
            classes: { $ne: idReceiver },
        }
        const sender = await User.findOneAndUpdate(queryObject, { $push: { classes: idReceiver } });
        if (!sender) throw new MyError('Bạn đã yêu cầu tham gia nhóm này', 404);

        const options = {
            new: true,
            fields: { name: 1 }
        };
        const updateObject = { $push: { students: idSender } };
        const receiver = await Class.findByIdAndUpdate(idReceiver, updateObject, options);
        if (!receiver) throw new MyError('Không tìm thấy nhóm', 404);
        return sender;
    }
    addStudents(req.params.idUser, req.params.grId)
        .then(data => res.json({
            statusCode: 1,
            message: 'Thêm học sinh thành công',
            data: {
                id: data._id, 
                name: data.name
            }
        }))
        .catch(err => res.json({
            statusCode: -1,
            message: err.message,
            data: 0
        }));
});
module.exports = router;