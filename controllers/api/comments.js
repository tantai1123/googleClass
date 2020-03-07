const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

const { MyError } = require('../../utils/myError');
const { checkObjectId } = require('../../utils/checkObjectId');

const Comment = require('../../models/Comment');
const Post = require('../../models/Post');
const User = require('../../models/User');

const validateCommentInput = require('../../validation/post');

//post api/stories/comments
router.post('/', passport.authenticate('jwt', {session:false}), (req,res) => {
  async function createComment(nameUser, idUser, idPost, text) {
    checkObjectId(idPost, idUser);
    if (!text) throw new MyError('Vui lòng nhập comment', 400);
    const comment = new Comment({ author: nameUser, userId: idUser, text, post: idPost });
    const updateObj = { $push: { comments: comment._id } };
    const post = await Post.findByIdAndUpdate(idPost, updateObj);
    if (!post) throw new MyError('Không tìm được bài viết', 404);
    await comment.save();
    const populateObject = {
      path: 'comments',
      populate: { path: 'userId', select: ['name','avatar'] }
    };
    return Post.findById(idPost)
      .populate('userId', { name: 'name', avatar: 'avatar' })
      .populate({
        path: 'comments',
        populate: {path: 'userId', select: ['name', 'avatar'] }});
    }
  const {errors, isValid} = validateCommentInput(req.body);
  if(!isValid){
    return res.status(400).json(errors);
  }
  const { text, idPost } = req.body;
  createComment(req.user.name, req.user.id, idPost, text)
    .then(data => res.json({
      statusCode: 1,
      message: 'Bình luận thành công',
      data: data
    }))
    .catch(err => res.json({
      statusCode: -1,
      message: err.message,
      data: 0
    }));
});

//delete api/comments/:_id
router.delete('/:_id', passport.authenticate('jwt', {session:false}), (req,res) => {
  async function removeComment(idUser, _id) {
    checkObjectId(_id, idUser);
    const query = { _id, userId: idUser };
    const comment = await Comment.findOneAndRemove(query);
    if (!comment) throw new MyError('Không tìm thấy bình luận', 404);
    await Post.findByIdAndUpdate(comment.post, { $pull: { comments: _id } });
    return comment;
  }
  removeComment(req.user.id, req.params._id)
    .then(data => res.send({
      statusCode: 1,
      message: 'Xóa comment thành công',
      data: null
    }))
    .catch(err => res.json({
      statusCode: -1,
      message: err.message,
      data: 0
    }))
});

module.exports = router;