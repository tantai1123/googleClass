const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
//Gọi model
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const Class = require('../../models/Class');

const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const base64ToImage = require('base64-to-image');
const SCOPES = ['https://www.googleapis.com/auth/drive'];

const TOKEN_PATH = 'token.json';

const FOLDER_ID = '1W0YP1hMT2C-bOF3NMoVwWzTPajEEiLCd'
const path = 'images/';
const FILE_NAME = new Date().getTime() + '.jpg'; 
const optionalObj = { 'fileName': FILE_NAME, 'type': 'jpg' };

let url;
let parseData;

// Authentication Google Drive API
function authorize(credentials, callback) {

  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]);

  fs.readFile(TOKEN_PATH, async (err, token) => {
    if (err) {
      return getAccessToken(oAuth2Client, callback);
    }
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);

      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
      });
      callback(oAuth2Client);
    });
  });
}

// Upload image
function storeFiles(auth) {
  console.log(url)
  const drive = google.drive({ version: 'v3', auth });
  var fileMetadata = {
    'name': FILE_NAME + req.body.image.mimeType,
    parents: [FOLDER_ID]
  };
  var media = {
    mimeType: 'image/jpg',
    body: fs.createReadStream(url)
  };
  drive.files.create({
    resource: fileMetadata,
    media: media,
    fields: 'id'
  }, function (err, file) {
    if (err) {
      console.error(err);
    } else {
      fs.unlinkSync(url)
      const paramsUrl = `https://drive.google.com/uc?export=view&id=${file.data.id}`
      parseData.image = paramsUrl;
      /////////////////
      parseData.save();
    }
  });
}

//Validation
const validatePostInput = require('../../validation/post');

//get api/stories
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  let result = []
  await Post.find({ group: null, event: null })
    .sort({ _id: -1 })
    .then(stories => {
      for (const Post of stories) {
        result.push({
          _id: Post._id,
          author: Post.author,
          text: Post.text,
          likes: Post.likes,
          comments: Post.comments,
          image: Post.image
        });
      }
      return res.json({
        statusCode: 1,
        message: 'Thành công',
        data: result
      })
    })
    .catch(err => res.status(404).json({
      statusCode: -1,
      message: 'Không tìm thấy bài viết nào',
      data: 0
    }));
});

//get api/stories/author
router.get('/:author', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Post.find({ author: req.params.author, group: null, event: null })
    .then(stories => res.json({
      statusCode: 1,
      message: 'Lấy bài viết thành công',
      data: stories
    }))
    .catch(err => res.status(404).json({
      statusCode: -1,
      message: 'Không tìm thấy bài viết nào',
      data: 0
    }));
});

//stories api/stories
router.post('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { errors, isValid } = validatePostInput(req.body);
  let Post;
  //Kiem tra
  if (!isValid) {
    return res.status(400).json(errors);
  }
  else {
    ///////////////
    if (req.body.image) {
      const file = await base64ToImage(req.body.image, path, optionalObj);
      url = 'images/' + file.fileName;
      parseData = new Post({
        text: req.body.text,
        author: req.user.name,
        userId: req.user.id,
      })
      fs.readFile('credentials.json', (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        authorize(JSON.parse(content), storeFiles);
        res.json({
          statusCode: 1,
          message: 'Đăng bài thành công'
        })
      });
    } else {
      Post = new Post({
        text: req.body.text,
        author: req.user.name,
        userId: req.user.id
      })
      /////////////////
      Post.save().then(Post => res.json({
        statusCode: 1,
        message: 'Đăng bài thành công',
        data: {
          _id: Post._id,
          author: Post.author,
          text: Post.text,
          likes: Post.likes,
          image: Post.image,
          comments: Post.comments
        }
      }));
    }
  }
});
//update Post
router.post('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { errors, isValid } = validatePostInput(req.body);
  checkObjectId(req.params.id);

  //Kiem tra
  if (!isValid) {
    return res.status(400).json(errors);
  }
  const PostUpdate = {};
  if (req.body.text) PostUpdate.text = req.body.text;
  await Profile.findOne({ user: req.user.id })
    .then(profile => {
      Post.findById(req.params.id)
        .then(Post => {
          //Kiểm tra quyền         
          if (Post.userId.toString() !== req.user.id) {
            return res.status(401).json({
              statusCode: -1,
              message: 'Bạn không có quyền sửa bài của người khác',
              data: 0
            });
          } else {
            //update
            Post.findOneAndUpdate({ _id: req.params.id }, { $set: PostUpdate }, { new: true }).then(Post => res.json({
              statusCode: 1,
              message: 'Cập nhật bài viết thành công',
              data: {
                _id: Post._id,
                author: Post.author,
                text: Post.text,
                likes: Post.likes,
                comments: Post.comments,
                image: Post.image
              }
            }));
          }
        })
        .catch(err => res.status(404).json({
          statusCode: -1,
          message: err.message,
          data: 0
        }));
    });
});

//delete api/stories/:id
router.delete('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  async function removePost(idUser, _id) {
    checkObjectId(_id, idUser);
    const query = { _id };
    const Post = await Post.findOneAndRemove(query);
    if (!Post) throw new MyError('Không tìm thấy bài viết', 404);
    await Comment.deleteOne({ _id: { $in: Post.comments } });
    await User.findByIdAndUpdate(idUser, { $pull: { stories: _id } });
    return Post;
  }
  await Post.findById(req.params.id).then(async Post => {
    if (req.user.permission.toString() == 'Admin' || req.user.id == Post.userId.toString()) {
      removePost(req.user.id, req.params.id)
        .then(data => res.json({
          statusCode: 1,
          message: 'Xóa bài viết thành công',
          data: null
        }))
        .catch(err => res.json({
          statusCode: -1,
          message: err.message,
          data: 0
        }));
    } else {
      return res.json({
        statusCode: -1,
        message: 'Bạn không có quyền xóa bài của người khác',
        data: 0
      })
    }
  })
});

//post api/stories/like/:id
router.post('/like/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
  async function likePost(idUser, _id) {
    checkObjectId(idUser, _id);
    //$ne: So khớp tất cả giá trị ko bằng với value được chỉ định.
    const queryObject = { _id, likes: { $ne: idUser } };
    const Post = await Post.findOneAndUpdate(queryObject, { $push: { likes: idUser } }, { new: true });
    if (!Post) throw new MyError('Không tìm thấy bài viết', 404);
    return Post;
  }
  likePost(req.user.id, req.params.id)
    .then(Post => res.json({
      statusCode: 1,
      message: 'Thích bài viết thành công',
      data: {
        _id: Post._id,
        author: Post.author,
        text: Post.text,
        likes: Post.likes,
        comments: Post.comments
      }
    }))
    .catch(err => res.json({
      statusCode: -1,
      message: err.message,
      data: 0
    })
    );
});
//post api/stories/dislike/:id
router.post('/dislike/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
  async function dislikePost(idUser, _id) {
    checkObjectId(idUser, _id);
    //$eq: So sánh bằng với value được chỉ định.
    const queryObject = { _id, likes: { $eq: idUser } };
    const Post = await Post.findOneAndUpdate(queryObject, { $pull: { likes: idUser } }, { new: true });
    if (!Post) throw new MyError('Không tìm thấy bài viết', 404);
    return Post;
  }
  dislikePost(req.user.id, req.params.id)
    .then(Post => res.json({
      statusCode: 1,
      message: 'Đã bỏ thích bài viết thành công',
      data: {
        _id: Post._id,
        author: Post.author,
        text: Post.text,
        likes: Post.likes,
        comments: Post.comments
      }
    }))
    .catch(err => res.json({
      statusCode: -1,
      message: err.message,
      data: 0
    }));
});
// router.post('/comment/:id', passport.authenticate('jwt', {session:false}), (req,res) => {
//   const {errors, isValid} = validatePostInput(req.body);
// //Kiem tra
//   if(!isValid){
//     return res.status(400).json(errors);
//   }
//   Post.findById(req.params.id)
//     .then(Post => {
//       const newComment = {
//         text: req.body.text,
//         name: req.body.name,
//         avatar: req.body.avatar,
//         user: req.body.user
//       }
//       //thêm comment
//       Post.comments.unshift(newComment);
//       //lưu
//       Post.save().then(res.json(Post))
//     })
//     .catch(err => res.status(404).json({Postnotfound:'Không tìm thấy bài viết này'}))
// });

// //delete api/stories/comment/:id/comment_id
// router.delete('/comment/:id/:comment_id', passport.authenticate('jwt', {session:false}), (req,res) => {
//   Post.findById(req.params.id)
//     .then(Post => {
//       //Kiểm tra comment có tồn tại?
//       if(Post.comments.filter(comment => comment._id.toString() === req.params.comment_id).lenght === 0)
//       {
//         return res.status(404).json({commentnotexists: 'Comment không tồn tại'})
//       }

//       //Tạo removeindex
//       const removeIndex = Post.comments
//         .map(item => item._id.toString())
//         .indexOf(req.params.comment_id);

//       //splice comment
//       Post.comments.splice(removeIndex, 1);

//       Post.save().then(Post => res.json(Post));
//     })
//     .catch(err => res.status(404).json({Postnotfound:'Không tìm thấy bài viết này'}))
// });

module.exports = router;