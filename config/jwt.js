const jwt = require('jsonwebtoken');
const keys = require('../config/keys');

function sign(obj) {
    return new Promise((resolve, reject) => {
        jwt.sign(obj, keys.secretOrKey, { expiresIn: '10 days' }, (error, token) => {
            if (error) return reject(error);
            resolve(token);
        });
    });
}

module.exports = { sign };