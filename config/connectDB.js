const mongoose = require('mongoose');
//db config
const db = require('./keys').mongoURI;
//Khai báo mongoose sử dụng Promise (bất đồng bộ)
mongoose.Promise = global.Promise;
mongoose.set('useFindAndModify',false);
mongoose.set('useUnifiedTopology', true);
//Hàm kết nối mongoose với thenable trả về (của Promise)
mongoose
    .connect(db, { useNewUrlParser: true })
    .then(() => console.log('Đã kết nối với Mongodb'))
    .catch(err => console.log(err));