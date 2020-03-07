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

router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
  let result = [];
  Class.find({ students: { $eq: req.user.id } || { teacher: { $eq: req.user.name } } })
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
});
router.get('/:clId', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Class.findById(req.params.clId).then(classs => {
    if (classs.students.indexOf(req.user.id) == -1 || classs.teacher.name === req.user.name) {
      return res.status(402).json({
        statusCode: -1,
        message: 'Bạn không ở trong nhóm này',
        data: 0
      });
    }
    let result = []
    return Post.find({ class: req.params.clId })
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
  })
    .catch(err => res.json({
      statusCode: -1,
      message: err.message,
      data: 0
    }))
});


// router.get('/:clId/teachers', passport.authenticate('jwt', { session: false }), async (req, res) => {
//   Class.findById(req.params.clId).then(classs => {
//     if (classs.students.indexOf(req.user.id) == -1 && classs.teacher.name !== req.user.name) {
//       return res.status(401).json({ notJoined: 'Bạn chưa tham gia nhóm' });
//     } else {
//       return res.json({
//         statusCode: 1,
//         message: 'Lấy danh sách giảng viên thành công',
//         data: classs.teacher
//       })
//     }
//   }).catch(err => res.json({
//     statusCode: -1,
//     message: 'Không tìm được nhóm',
//     data: 0
//   }));
// });
// router.get('/:clId/students', passport.authenticate('jwt', { session: false }), async (req, res) => {
//   Class.findById(req.params.clId).then(classs => {
//     if (classs.students.indexOf(req.user.id) == -1 && classs.teacher.name !== req.user.name) {
//       return res.status(401).json({ notJoined: 'Bạn chưa tham gia nhóm' });
//     } else {
//       return res.json({
//         statusCode: 1,
//         message: 'Lấy danh sách thành viên thành công',
//         data: classs.students
//       })
//     }
//   }).catch(err => res.json({
//     statusCode: -1,
//     message: 'Không tìm được nhóm',
//     data: 0
//   }));
// });
router.get('/:clId/members', passport.authenticate('jwt', { session: false }), async (req, res) => {
  Class.findById(req.params.clId).then(classs => {
    if (classs.students.indexOf(req.user.id) == -1 && classs.teacher.name !== req.user.name) {
      return res.status(401).json({ notJoined: 'Bạn chưa tham gia nhóm' });
    } else {
      return res.json({
        statusCode: 1,
        message: 'Lấy danh sách thành viên thành công',
        data: {
          teacher: classs.teacher,
          students: classs.students
        }
      })
    }
  }).catch(err => res.json({
    statusCode: -1,
    message: 'Không tìm được nhóm',
    data: 0
  }));
});
module.exports = router;