const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const mongoose = require('mongoose');
const User = mongoose.model('User');
const keys = require('../config/keys');

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys.secretOrKey;

module.exports = passport => {
    passport.use(
        new JwtStrategy(opts, (jwt_payload, done) => {
            User.findById(jwt_payload.id) //Tìm tài khoản theo Id
                .then(user => {
                    if(user) {
                        return done(null, user); //Tìm thấy
                    }
                    return done(null, false); //K tìm thấy
                })
                .catch(err => console.log(err));
        })
    );
};