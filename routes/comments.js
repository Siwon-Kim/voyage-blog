const express = require("express");
const router = express.Router();

const Posts = require("../schemas/posts.js");
const Comments = require("../schemas/comments.js");

// GET: 댓글 목록 조회 API
//     - 조회하는 게시글에 작성된 모든 댓글을 목록 형식으로 볼 수 있도록 하기
//     - 작성 날짜 기준으로 내림차순 정렬하기
router.get('/posts/:_postId/comments', async (req, res) => {

});

// POST: 댓글 작성 API
//     - 댓글 내용을 비워둔 채 댓글 작성 API를 호출하면 "댓글 내용을 입력해주세요" 라는 메세지를 return하기
//     - 댓글 내용을 입력하고 댓글 작성 API를 호출한 경우 작성한 댓글을 추가하기
router.post('/posts/:_postId/comments', async (req, res) => {

});

// PUT: 댓글 수정 API
//     - 댓글 내용을 비워둔 채 댓글 수정 API를 호출하면 "댓글 내용을 입력해주세요" 라는 메세지를 return하기
//     - 댓글 내용을 입력하고 댓글 수정 API를 호출한 경우 작성한 댓글을 수정하기
router.put('/posts/:_postId/comments/:_commentId', async (req, res) => {

});

// DELETE: 댓글 삭제 API
//     - 원하는 댓글을 삭제하기
router.delete('/posts/:_postId/comments/:_commentId', async (req, res) => {
    
});

module.exports = router;