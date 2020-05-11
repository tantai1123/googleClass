const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const flash = require("connect-flash");


const users = require('./api/controllers/users');
const profile = require('./api/controllers/profile');
const classes = require('./api/controllers/classes');
const comments = require('./api/controllers/comments');
const admin = require('./api/controllers/admin');
const staff = require('./api/controllers/staff');
var cors = require('cors')
require('./config/seedDb');
const app = express();
app.use((req, res, next) => {
    res.onError = function (error) {
        const body = { message: error.message, success: false };
        if (!error.statusCode) console.log(error);
        res.status(error.statusCode || 500).json(body);
    };
    next();
});
//Body-Parser
app.use(bodyParser.urlencoded({extended:true, limit:'50mb', parameterLimit:50000}));
app.use(bodyParser.json({limit: '50mb'}));
app.use(cors());
require('./config/connectDB');

//passport
app.use(flash());
app.use(passport.initialize());
//passport config
require('./config/passport')(passport);

app.use('/users', users);
app.use('/profile', profile);
app.use('/classes', classes);
app.use('/comments', comments);
app.use('/admin', admin);
app.use('/staff', staff);

const port = process.env.PORT || 1234;

app.listen(port, () => console.log(`Server đang khởi động trên port ${port}`));