// const Perm = require('../models/Permission');
const User = require('../models/User');
const isEmpty = require('../utils/isEmpty');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
async function seedDb() {
    const checkUser = await User.findOne({ name: 'Admin' });
    // const checkPerm = await Perm.find({});
    if (/*isEmpty(checkPerm) && */!(checkUser)) {
        // const perm_1 = new Perm({
        //     name: 'Admin'
        // });
        // const perm_2 = new Perm({
        //     name: 'Staff'
        // })
        // const admin = await perm_1.save();
        // const mod = await perm_2.save();
        const req = {
            body: {
                gmail: 'admin@gmail.com',
                password: 'admin1234',
                name: 'Admin',
                isAdmin: true
            }
        }
        const req2 = {
            body: {
                email: 'staff@gmail.com',
                password: 'staff1234',
                name: 'Staff',
                isStaff: true
            }
        }
        const avatar = gravatar.url(req.body.email, {
            s: '200', //size
            r: 'pg', //rating
            d: 'mm' //default
        });
        //mã hóa
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(req.body.password, salt, (err, hash) => {
                seedUser();
                async function seedUser() {
                    if (err) throw err;
                    req.body.password = hash;
                    // Tạo mới 1 tài khoản
                    const newUser = new User({
                        gmail: req.body.gmail,
                        password: req.body.password,
                        name: req.body.name,
                        isAdmin: req.body.isAdmin,
                        // permission: admin.name,
                        avatar
                    });

                    user = await newUser.save();
                    // await Perm.findById(admin._id)
                    //     .then(perm => {
                    //         perm.users.unshift(user);
                    //         perm.save()
                    //     });
                    console.log('Thêm dữ liệu Admin thành công');
                }
            });
        });
        //-----
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(req2.body.password, salt, (err, hash) => {
                seedUser2();
                async function seedUser2() {
                    if (err) throw err;
                    req2.body.password = hash;
                    // Tạo mới 1 tài khoản
                    const newUser = new User({
                        gmail: req2.body.gmail,
                        password: req2.body.password,
                        name: req2.body.name,
                        isStaff: req2.body.isStaff,
                        avatar
                    });

                    user = await newUser.save();
                    // await Perm.findById(mod._id)
                    //     .then(perm => {
                    //         perm.users.unshift(user);
                    //         perm.save()
                    //     });
                    console.log('Thêm dữ liệu staff thành công');
                }
            });
        });

    } else {
        console.log('Còn tồn tại dữ liệu mẫu')
    }
}
seedDb();