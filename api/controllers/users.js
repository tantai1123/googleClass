const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const password = require('passport');
const crypto = require('crypto');
const Async = require('async');
var nodemailer = require("nodemailer");
const { hash, compare } = require('bcryptjs');
const { sign } = require('../../config/jwt');

const { MyError } = require('../../utils/myError');
//
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');
const ValidatePasswordInput = require('../../validation/changepass');

//
const User = require('../../models/User');
//thông tin mail admin
const adminMail = require('../../config/adminMail');

router.post('/register', (req, res) => {

    async function register(data) {
        const { name, gmail, password, secretCode } = data;
        const findUser = await User.findOne({ name: name });
        if (findUser) throw new MyError('Tên đăng nhập đã được sử dụng', 400);
        const findEmail = await User.findOne({ gmail: gmail });
        if (findEmail) throw new MyError('Gmail đã được sử dụng', 400);
        if (secretCode == 'secretcode123') var isTeacher = true;
        const hashPassword = await hash(password, 8);
        const avatar = gravatar.url(gmail, {
            s: '200', //size
            r: 'pg', //rating
            d: 'mm' //default
        });
        const user = new User({ name, gmail, password: hashPassword, avatar, isTeacher: isTeacher });
        await user.save();
        const userInfo = user.toObject();
        delete userInfo.password;
        //Profile
        const profile = new Profile({ user: userInfo._id, name: userInfo.name });
        await profile.save();
        return userInfo;
    }
    const { errors, isValid } = validateRegisterInput(req.body);
    if (!isValid) {
        return res.status(400).json(errors);
    }
    register(req.body)
        .then(user => res.send({
            message: 'Đăng ký thành công',
            data: {
                name: user.name,
                gmail: user.gmail,
                avatar: user.avatar,
                isTeacher: user.isTeacher,
                isAdmin: user.isAdmin,
                isStaff: user.isStaff
            }
        }))
        .catch(res.onError);
});
router.post('/login', async (req, res) => {
    const { errors, isValid } = validateLoginInput(req.body);
    if (!isValid) {
        return res.status(400).json(errors);
    }
    async function logIn(name, password) {
        const user = await User.findOne({ name });
        if (!user) throw new MyError('Tài khoản không tồn tại', 404);
        const isMatch = await compare(password, user.password);
        if (!isMatch) throw new MyError('Sai mật khẩu', 404);
        const payload = { id: user.id, name: user.name, avatar: user.avatar, perm: user.permission, isTeacher: user.isTeacher, isAdmin: user.isAdmin, isStaff: user.isStaff }
        const token = await sign(payload);
        return { token, payload };
    }
    //Tìm tài khoản qua gmail
    logIn(req.body.name, req.body.password)
        .then(user => res.send({
            message: 'Đăng nhập thành công',
            token: 'Bearer ' + user.token,
            isAdmin: user.payload.isAdmin,
            isStaff: user.payload.isStaff,
            isTeacher: user.payload.isTeacher
        }))
        .catch(res.onError);
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
                    user.resetPasswordExpires = Date.now() + 300000; // 5 min

                    user.save(function (err) {
                        done(err, token, user);
                    });
                }
            });
        },
        function (token, user, done) {
            var smtpTransport = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {
                    user: adminMail.user,
                    pass: adminMail.pass
                },
                tls: {
                    // do not fail on invalid certs
                    rejectUnauthorized: false
                }
            });
            var mailOptions = {
                to: user.gmail,
                from: adminMail.user,
                subject: 'Yêu cầu thay đổi mật khẩu từ website gì gì đó',
                text: 'Bạn nhận được thư này vì bạn (hoặc ai đó) đã yêu cầu thay đổi password tài khoản của bạn.\n\n' +
                    'Hãy nhấn vào link đính kèm, hoặc paste nó vào trình duyệt:\n\n' +
                    'http://' + 'localhost:3000' + '/users/reset/' + token + '\n\n' +
                    'Nếu bạn không yêu cầu việc này thì bỏ qua thư này nhé!! ~Thân~.\n'
            };
            smtpTransport.sendMail(mailOptions, function (err) {
                console.log('mail sent');
                res.json({
                    statusCode: 1,
                    message: 'Đã gửi gmail tới ' + user.gmail,
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
                message: 'Trang này thay đổi mật khẩu',
                data: req.params.token
            });
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
                                await User.findOneAndUpdate({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, { $set: { password: req.body.newPassword, resetPasswordExpires: Date.now() } });
                                done(err, user);
                                return res.status(400).json({
                                    message: 'Thay đổi mật khẩu thành công, mời đăng nhập lại!',
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
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {
                    user: adminMail.user,
                    pass: adminMail.pass
                },
                tls: {
                    // do not fail on invalid certs
                    rejectUnauthorized: false
                }
            });
            var mailOptions = {
                to: user.gmail,
                from: adminMail.user,
                subject: 'Mật khẩu của bạn đã được thay đổi',
                text: 'Chao xìn,\n\n' +
                    'Đây là thư xác nhận rằng tài khoản liên kết đến ' + user.gmail + ' của bạn vừa được đổi mật khẩu.\n'
            };
            smtpTransport.sendMail(mailOptions, function (err) {
                console.log('Confirmation mail has been sent');
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