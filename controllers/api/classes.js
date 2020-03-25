const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

const Class = require('../../models/Class');
const User = require('../../models/User');
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
const { UploadFileServices } = require('../../utils/upload');

const multer = require('multer');
const fs = require('fs');
const imageUploader = multer({ dest: 'images/' });

const validatePostInput = require('../../validation/post');

const { checkObjectId } = require('../../utils/checkObjectId');
const { MyError } = require('../../utils/myError');

router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
  let result = [];
  Class.find({ members: { $eq: req.user.id } })
    .sort({ date: -1 })
    .populate('teacher', ['name'])
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
    if (classs.members.indexOf(req.user.id) == -1) {
      return res.status(402).json({
        statusCode: -1,
        message: 'Bạn không ở trong nhóm này',
        data: 0
      });
    }
    let result = []
    return Post.find({ class: req.params.clId })
      .populate('comments', ['author', 'text'])
      .sort({ _id: -1 })
      .then(posts => {
        for (const post of posts) {
          result.push({
            _id: post._id,
            class: post.class,
            author: post.author,
            text: post.text,
            image: post.image,
            extension: post.extension,
            fileName: post.fileName,
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

router.get('/:clId/members', passport.authenticate('jwt', { session: false }), async (req, res) => {
  Class.findById(req.params.clId)
    .populate('teacher', ['name', 'avatar'])
    .populate('students', ['name', 'avatar'])
    .then(classs => {
      if (classs.members.indexOf(req.user.id) == -1) {
        return res.status(401).json({ notJoined: 'Bạn chưa tham gia lớp' });
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
      message: 'Không tìm được lớp',
      data: 0
    }));
});
router.post('/:clId', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { errors, isValid } = validatePostInput(req.body);
  let post;
  //Kiem tra
  if (!isValid) {
    return res.status(400).json(errors);
  }

  else {
    post = new Post({
      text: req.body.text,
      author: req.user.name,
      userId: req.user.id,
      image: req.body.image,
      extension: req.body.extension,
      fileName: req.body.fileName,
      class: req.params.clId
    });
    /////////////////
    post.save().then(post => res.json({
      statusCode: 1,
      message: 'Đăng bài thành công',
      data: {
        _id: post._id,
        author: post.author,
        text: post.text,
        likes: post.likes,
        image: post.image,
        comments: post.comments
      }
    }));
  }
});
// upload file
router.post('/:clId/upload', imageUploader.single('myFile'), async (req, res) => {
  const dataFile = req.file;
  let extensionType = false;
  let extensionName = dataFile.originalname;
  extensionName = extensionName.split('.').pop();

  const fullPathFile = dataFile.path;

  const newFullPath = `${fullPathFile}.${extensionName}`;
  fs.renameSync(fullPathFile, newFullPath);

  if (extensionName === 'jpg' || extensionName === 'jpeg' || extensionName === 'png') {
    extensionType = true;
  }

  const result = await UploadFileServices.uploadFile(newFullPath, dataFile.mimetype, dataFile.filename);
  res.json({
    statusCode: 1,
    message: 'Upload file thành công',
    data: {
      url: result,
      extension: extensionType,
      originalname: dataFile.originalname
    }
  });
});
module.exports = router;