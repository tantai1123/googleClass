const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const flash = require("connect-flash");


const users = require('./controllers/api/users');
const profile = require('./controllers/api/profile');
const classes = require('./controllers/api/classes');
const comments = require('./controllers/api/comments');
const admin = require('./controllers/api/admin');
var cors = require('cors')
require('./config/seedDb');
const app = express();

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

const port = process.env.PORT || 1234;

app.listen(port, () => console.log(`Server đang khởi động tren port ${port}`));