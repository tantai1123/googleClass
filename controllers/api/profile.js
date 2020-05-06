const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
// require('../../config/checkPerm');

const validateProfileInput = require('../../validation/profile');
const validateEducationInput = require('../../validation/education');

const { checkObjectId } = require('../../utils/checkObjectId');
const { MyError } = require('../../utils/myError');

//Tải model profile
const Profile = require('../../models/Profile');
//Tải model user
const User = require('../../models/User');


//GET Profile
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {

  // Tìm thông tin của tài khoản
  await Profile.findOne({ user: req.user.id })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
      if (!profile) {
        return res.status(404).json({
          statusCode: -1,
          message: 'Bạn chưa cập nhật thông tin tài khoản',
          data: 0
        }); //Không có profile sẽ báo lỗi
      }
      res.json({
        statusCode: 1,
        message: 'Lấy thông tin thành công',
        data: profile
      });// Nếu có sẽ trả về thông tin profile
    })
    .catch(err => res.status(404).json({
      statusCode: -1,
      message: err.message,
      data: 0
    }));
}
);

router.get('/handle', passport.authenticate('jwt', { session: false }), (req, res) => {
  async function getHandleUser() {
    const profile = await Profile.findOne({ user: idUser })
      .populate('user', ['name', 'avatar'])
    if (!profile) throw new MyError('Profile not found', 404);
    return profile;
  }
  getHandleUser(req.user.id)
    .then(profile => res.send({ 
      statusCode: 1,
      message: 'Thành công',
      data: profile
     }))
    .catch({
      statusCode: -1,
      message: err.message,
      data: 0
    });
});

//GET profile/user/:user_id
router.get('/user/:name', async (req, res) => {
  await Profile.findOne({ name: req.params.name })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
      if (!profile) {
        res.status(404).json({
          statusCode: -1,
          message: 'Người dùng này chưa cài đặt thông tin tài khoản',
          data: 0
        });
      } else {
        res.json({
          statusCode: 1,
          message: 'Lấy thông tin thành công',
          data: profile
        });
      }
    })
    .catch(err => res.status(404).json({
      statusCode: -1,
      message: 'Không có profile của người dùng này',
      data: 0
    }));
});

//POST profile
router.post('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { errors, isValid } = validateProfileInput(req.body);
  //Kiểm tra và báo lỗi
  if (!isValid) {
    return res.status(400).json(errors)
  }

  const profileFields = {};
  profileFields.user = req.user.id;
  if (req.body.fullname) profileFields.fullname = req.body.fullname;
  if (req.body.maso) profileFields.maso = req.body.maso;

  profileFields.social = {};
  if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
  if (req.body.zalo) profileFields.social.zalo = req.body.zalo;
  if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
  if (req.body.instagram) profileFields.social.instagram = req.body.instagram;

  await Profile.findOne({ user: req.user.id })
    .then(profile => {
      if (profile) {
        //Có thì update
        Profile.findOneAndUpdate({ user: req.user.id }, { $set: profileFields }, { new: true })
          .then(profile => res.json({
            statusCode: 1,
            message: 'Cập nhật thông tin thành công',
            data: profile
          }));
      } else {
        //Chưa có thì tạo mới
        new Profile(profileFields).save().then(profile => res.json({
          statusCode: 1,
          message: 'Tạo mới thông tin thành công',
          data: profile
        }));
      }
    });
});

//POST education
router.post('/education', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { errors, isValid } = validateEducationInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  await Profile.findOne({ user: req.user.id }).then(profile => {
    const newEdu = {
      school: req.body.school,
      degree: req.body.degree,
      fieldofstudy: req.body.fieldofstudy,
      from: req.body.from,
      to: req.body.to,
      current: req.body.current,
      description: req.body.description
    };
    profile.education.unshift(newEdu);
    profile.save().then(profile => res.json({
      statusCode: 1,
      message: 'Tạo mới thông tin học vấn thành công',
      data: {
        name: req.user.name,
        education: profile.education
      }
    }));
  });
});

//Xóa api/profile/education/:edu_id
router.delete('/education/:edu_id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Profile.findOne({ user: req.user.id }).then(profile => {
    if (!profile) { throw new MyError('Không tìm thấy profile', 404) }
    // remove Index
    const removeIndex = profile.education
      .map(item => item.id)
      .indexOf(req.params.edu_id);
    //Xóa
    if (removeIndex == -1) throw new MyError('Không tìm thấy edu này', 404);
    profile.education.splice(removeIndex, 1);
    //Lưu
    profile.save().then(profile => res.json({
      statusCode: 1,
      message: 'Xóa thành công',
      data: profile
    }));
  })
    .catch(err => res.status(404).json({
      statusCode: -1,
      message: err.message,
      data: 0
    }));
});

module.exports = router;