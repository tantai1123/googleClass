const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const flash = require("connect-flash");


const users = require('./controllers/api/users');
const profile = require('./controllers/api/profile');
const posts = require('./controllers/api/posts');
const classes = require('./controllers/api/classes');
const messages = require('./controllers/api/messages');
const comments = require('./controllers/api/comments');
const fileupload = require('./controllers/api/fileupload');
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

app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/posts', posts);
// app.use('/api/classes', classes);
// app.use('/api/messages', messages);
// app.use('/api/comments', comments);
// app.use('/api/fileupload', fileupload);

const port = process.env.PORT || 1234;

app.listen(port, () => console.log('Server đang khởi động'));