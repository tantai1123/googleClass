const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const { hash, compare } = require('bcryptjs');
const gravatar = require('gravatar');

const Class = require('../../models/Class');
const User = require('../../models/User');
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');

const validateCreateClass = require('../../validation/class');
const validatePostInput = require('../../validation/post');
const validateRegisterInput = require('../../validation/register');


const { checkObjectId } = require('../../utils/checkObjectId');
const { MyError } = require('../../utils/myError');

router.get('/user/all', passport.authenticate('jwt', { session: false }), async (req, res) => {
    async function AllUser(idAdmin) {
        checkObjectId(idAdmin);
        const admin = await User.findById(idAdmin);
        if (!admin) throw new MyError('Không tìm thấy người dùng', 404);
        if (!admin.isAdmin) throw new MyError('Không có quyền', 401);
        return User.find();
    }
    let result = [];
    AllUser(req.user.id)
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
            return res.send({
                message: 'Danh sách người dùng',
                data: result
            })
        })
        .catch(res.onError);
});
router.get('/profile/all', passport.authenticate('jwt', { session: false }), async (req, res) => {
    async function AllProfile(idAdmin) {
        checkObjectId(idAdmin);
        const admin = User.findById(idAdmin);
        if (!admin) throw new MyError('Không tìm thấy người dùng', 404);
        if (admin.isAdmin == false) throw new MyError('Không có quyền', 401);
        return Profile.find().populate('user', ['name', 'avatar']);
    }
    AllProfile(req.user.id)
        .then(profiles => res.send({
            message: 'Thành công',
            data: profiles
        }))
        .catch(res.onError);
});
router.get('/profile/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    async function getProfileById(_id) {
        const profile = await Profile.findById(_id)
            .populate('user', ['name', 'avatar'])
        if (!profile) throw new MyError('Không tìm thấy thông tin', 404);
        return profile;
    }
    getProfileById(req.params.id)
        .then(profile => res.send({
            message: 'thành công',
            data: profile
        }))
        .catch(res.onError);
})
router.post('/user/add', passport.authenticate('jwt', { session: false }), async (req, res) => {
    async function addPerson(data) {
        const { name, gmail, password, isTeacher, isStaff } = data;
        const findUser = await User.findOne({ name: name });
        if (findUser) throw new MyError('Tên đăng nhập đã được sử dụng', 400);
        const findGmail = await User.findOne({ gmail: gmail });
        if (findGmail) throw new MyError('Email đã được sử dụng', 400);
        const hashPassword = await hash(password, 8);
        const avatar = gravatar.url(gmail, {
            s: '200', //size
            r: 'pg', //rating
            d: 'mm' //default
        });
        const user = new User({ name, gmail, password: hashPassword, avatar, isTeacher, isStaff });
        await user.save();
        const userInfo = user.toObject();
        delete userInfo.password;
        //Profile
        // const profile = new Profile({ user: userInfo._id, name: userInfo.name });
        // await profile.save();
        return userInfo;
    }
    const { errors, isValid } = validateRegisterInput(req.body);
    if (!isValid) {
        return res.status(400).json(errors);
    }
    addPerson(req.body)
        .then(user => res.send({
            message: 'Thêm thành công',
            data: {
                name: user.name,
                gmail: user.gmail,
                avatar: user.avatar
            }
        }))
        .catch(res.onError);
})
router.post('/changerole/teacher/:idTeacher', passport.authenticate('jwt', { session: false }), async (req, res) => {
    async function changeRoleUserTeacher(idUser, idTeacher) {
        checkObjectId(idUser, idTeacher);
        const isAdmin = User.findById(idUser);
        if (isAdmin.isAdmin = false) throw new MyError('Không có quyền', 401);
        const queryObjectTeacher = {
            _id: idTeacher,
            isTeacher: false
        }
        const updateObjectTeacher = {
            $set: { isTeacher: true, isStaff: false }
        }
        const teacher = await User.findOneAndUpdate(queryObjectTeacher, updateObjectTeacher);
        if (!teacher) throw new MyError('User này đã là giáo viên', 402);
        const userInfo = teacher.toObject();
        delete userInfo.password;
        return userInfo;
    }
    changeRoleUserTeacher(req.user.id, req.params.idTeacher)
        .then(teacher => res.send({
            message: 'thành công',
            data: {
                _id: teacher.id,
                isAdmin: teacher.isAdmin,
                isStaff: teacher.isStaff,
                isTeacher: teacher.isTeacher,
                classes: teacher.classes,
                gmail: teacher.gmail,
                name: teacher.name,
                avatar: teacher.avatar
            }
        }))
        .catch(res.onError)
});

router.post('/changerole/staff/:idStaff', passport.authenticate('jwt', { session: false }), async (req, res) => {
    async function changeRoleUserStaff(idUser, idStaff) {
        checkObjectId(idUser, idStaff);
        const isAdmin = User.findById(idUser);
        if (isAdmin.isAdmin = false) throw new MyError('Không có quyền', 401);
        const queryObjectStaff = {
            _id: idStaff,
            isStaff: false
        }
        const updateObjectStaff = {
            $set: { isStaff: true, isTeacher: false }
        }
        const staff = await User.findOneAndUpdate(queryObjectStaff, updateObjectStaff);
        if (!staff) throw new MyError('User này đã là Staff', 402);
        return staff
    }
    changeRoleUserStaff(req.user.id, req.params.idStaff)
        .then(staff => res.send({
            message: 'thành công',
            data: {
                _id: staff.id,
                isAdmin: staff.isAdmin,
                isStaff: staff.isStaff,
                isTeacher: staff.isTeacher,
                classes: staff.classes,
                gmail: staff.gmail,
                name: staff.name,
                avatar: staff.avatar
            }
        }))
        .catch(res.onError)
});

router.post('/changerole/student/:idStudent', passport.authenticate('jwt', { session: false }), async (req, res) => {
    async function changeRoleUserStudent(idUser, idStudent) {
        checkObjectId(idUser, idStudent);
        const isAdmin = User.findById(idUser);
        if (isAdmin.isAdmin = false) throw new MyError('Không có quyền', 401);
        const queryObjectStaff = {
            _id: idStudent,
            $or: [{ isStaff: true }, { isTeacher: true }]
        }
        const updateObjectStaff = {
            $set: { isTeacher: false, isStaff: false }
        }
        const student = await User.findOneAndUpdate(queryObjectStaff, updateObjectStaff);
        if (!student) throw new MyError('User này đã là Student', 402);
        return student;
    }
    changeRoleUserStudent(req.user.id, req.params.idStudent)
        .then(student => res.send({
            message: 'thành công',
            data: student
        }))
        .catch(res.onError)
});

router.delete('/user/remove/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    async function removeUser(idAdmin, idUser) {
        checkObjectId(idUser, idAdmin);
        const admin = User.findById(idAdmin);
        if (!admin) throw new MyError('Không tìm thấy người dùng', 404);
        if (admin.isAdmin == false) throw new MyError('Không có quyền', 401);
        const user = await User.findByIdAndRemove(idUser)
        const profile = await Profile.findOneAndRemove({ user: idUser });
        return user;
    }
    removeUser(req.user.id, req.params.id)
        .then(user => res.send({
            message: 'Xóa thành công',
            data: user
        }))
        .catch(res.onError);
})

module.exports = router;