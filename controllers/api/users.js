const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const password = require('passport');
const crypto = require('crypto');
const Async = require('async');
var nodemailer = require("nodemailer");

// const checkPerm = require('../../config/checkPerm');

//
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');
const ValidatePasswordInput = require('../../validation/changepass');

//
const User = require('../../models/User');
//thông tin mail admin
const adminMail = require('../../config/adminMail');

router.post('/register', (req, res) => {
    const { errors, isValid } = validateRegisterInput(req.body);
    if (!isValid) {
        return res.status(400).json(errors);
    }
    User.findOne({ gmail: req.body.gmail }).then(user => {
        if (user) {
            return res.status(400).json({
                stastatusCodetus: -1,
                message: 'Gmail đã được sử dụng, hãy chọn gmail khác',
                data: 0
            });
        } else {
            User.findOne({ name: req.body.name }).then(user => {
                if (user) {
                    return res.status(400).json({
                        statusCode: -1,
                        message: 'Nickname này đã được sử dụng, hãy chọn một tên khác',
                        data: 0
                    });
                } else {
                    const avatar = gravatar.url(req.body.gmail, {
                        s: '200', //size
                        r: 'pg', //rating
                        d: 'mm' //default
                    });
                    // Mã hóa       
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(req.body.password, salt, (err, hash) => {
                            if (err) throw err;
                            req.body.password = hash;
                            // Tạo mới 1 tài khoản
                            var newUser = new User({
                                gmail: req.body.gmail,
                                password: req.body.password,
                                name: req.body.name,
                                avatar,
                            });
                            if (req.body.secretCode === 'secretcode123') { newUser.isTeacher = true; }
                            newUser.save()
                                .then(user => res.json({
                                    statusCode: 1,
                                    message: 'Tạo mới thành công',
                                    data: {
                                        gmail: user.gmail,
                                        name: user.name,
                                        avatar: user.avatar,
                                        isTeacher: user.isTeacher
                                    }
                                })); //thông báo
                        });
                    });
                }
            });
        };
    });
});
router.post('/login', async (req, res) => {
    const gmail = req.body.gmail;
    const password = req.body.password;
    const { errors, isValid } = validateLoginInput(req.body);

    if (!isValid) {
        return res.status(400).json(errors);
    }

    //Tìm tài khoản qua gmail
    await User.findOne({ gmail }).then(user => {
        //Kiểm tra gmail
        if (!user) {
            return res.status(404).json({
                statusCode: -1,
                message: 'Tài khoản không tồn tại',
                data: 0
            });
        }
        else {
            User.findOne({ gmail }).then(user => {
                if (user) {
                    //Kiểm tra mật khẩu
                    bcrypt.compare(password, user.password).then(isMatch => {
                        if (isMatch) {
                            const payload = { id: user.id, name: user.name, avatar: user.avatar, perm: user.permission, isTeacher: user.isTeacher, isAdmin: user.isAdmin }; //Tạo jwt payload
                            //đăng nhập token, sau expiresIn mã sẽ hết hạn và phải đăng nhập lại
                            jwt.sign(payload, keys.secretOrKey, { expiresIn: '10 days' },
                                (err, token) => {
                                    res.json({
                                        statusCode: 1,
                                        message: 'Đăng nhập thành công',
                                        token: 'Bearer ' + token
                                    });
                                }
                            );
                        } else {
                            return res.status(400).json({
                                statusCode: -1,
                                message: 'Sai mật khẩu',
                                data: 0
                            });
                        }
                    });
                }
            })
        }
    });
});
router.post('/changepassword', password.authenticate('jwt', { session: false }), async (req, res) => {
    const { errors, isValid } = ValidatePasswordInput(req.body);
    if (!isValid) {
        return res.status(400).json(errors);
    }
    await User.findById(req.user.id).then(user => {
        if (!user) {
            return res.json({
                statusCode: -1,
                message: 'Tài khoản không tồn tại',
                data: 0
            })
        } else {
            bcrypt.compare(req.body.oldPassword, user.password).then(isMatch => {
                if (isMatch) {
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(req.body.newPassword, salt, async (err, hash) => {
                            if (err) throw err;
                            req.body.newPassword = hash;
                            await User.findByIdAndUpdate(req.user.id, { $set: { password: req.body.newPassword } });
                            return res.status(400).json({
                                statusCode: 1,
                                message: 'Thay đổi mật khẩu thành công',
                                data: 0
                            });
                        })
                    })
                } else {
                    return res.status(400).json({
                        statusCode: -1,
                        message: 'Sai mật khẩu cũ',
                        data: 0
                    });
                }
            })
        }
    })
});
router.post('/forgot', function (req, res, next) {
    Async.waterfall([
        function (done) {
            crypto.randomBytes(20, function (err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function (token, done) {
            User.findOne({ gmail: req.body.gmail }, function (err, user) {
                if (!user) {
                    res.json({
                        statusCode: -1,
                        message: 'Tài khoản không tồn tại',
                        data: 0
                    })
                } else {
                    user.resetPasswordToken = token;
                    user.resetPasswordExpires = Date.now() + 600000; // 10 min

                    user.save(function (err) {
                        done(err, token, user);
                    });
                }
            });
        },
        function (token, user, done) {
            var smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: adminMail.user,
                    pass: adminMail.pass
                }
            });
            var mailOptions = {
                to: user.gmail,
                from: adminMail.user,
                subject: 'Yêu cầu thay đổi mật khẩu từ website gì gì đó',
                text: 'Bạn nhận được thư này vì bạn (hoặc ai đó) đã yêu cầu thay đổi password tài khoản của bạn.\n\n' +
                    'Hãy nhấn vào link đính kèm, hoặc paste nó vào trình duyệt:\n\n' +
                    'http://' + req.headers.host + '/users/reset/' + token + '\n\n' +
                    'Nếu bạn không yêu cầu việc này thì bỏ qua thư này nhé!! ~Thân~.\n'
            };
            smtpTransport.sendMail(mailOptions, function (err) {
                console.log('mail sent');
                res.json({
                    statusCode: 1,
                    message: 'Đã gửi mail tới ' + user.gmail,
                })
            });
        }
    ], function (err) {
        if (err) return next(err);
    });
});
router.get('/reset/:token', async (req, res) => {
    await User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, (err, user) => {
        if (!user) {
            return res.json({
                statusCode: -1,
                message: 'Token đã hết hạn',
            })
        } else {
            return res.json({
                statusCode: 1,
                message: 'Trang này thay đổi mật khẩu'
            })
        }

    });
});
router.post('/reset/:token', function (req, res) {
    Async.waterfall([
        function (done) {
            User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
                if (!user) {
                    res.json({
                        statusCode: -1,
                        message: 'Token hết hạn'
                    });
                } else {
                    const { errors, isValid } = ValidatePasswordInput(req.body);
                    if (!isValid) {
                        return res.status(400).json(errors);
                    } else {
                        bcrypt.genSalt(10, (err, salt) => {
                            bcrypt.hash(req.body.newPassword, salt, async (err, hash) => {
                                if (err) throw err;
                                req.body.newPassword = hash;
                                await User.findOneAndUpdate({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, { $set: { password: req.body.newPassword } });
                                return res.status(400).json({
                                    statusCode: 1,
                                    message: 'Thay đổi mật khẩu thành công, mời đăng nhập lại',
                                    data: 0
                                });
                            })
                        })
                    }
                }
            });
        },
        function (user, done) {
            var smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: adminMail.user,
                    pass: adminMail.pass
                }
            });
            var mailOptions = {
                to: user.email,
                from: adminMail.user,
                subject: 'Mật khẩu của bạn đã được thay đổi',
                text: 'Chao xìn,\n\n' +
                    'Đây là thư xác nhận rằng tài khoản ' + user.email + ' của bạn vừa được đổi mật khẩu.\n'
            };
            smtpTransport.sendMail(mailOptions, function (err) {
                res.json({
                    statusCode: 1,
                    message: 'Thay đổi password thành công'
                })
            });
        }
    ], function (err) {
        return res.json({
            statusCode: -1,
            message: 'Lỗi'
        })
    });
});
router.get('/current', password.authenticate('jwt', { session: false }), (req, res) => {
    res.json({
        id: req.user.id,
        name: req.user.name,
        gmail: req.user.gmail,
        avatar: req.user.avatar
    });
});

module.exports = router;