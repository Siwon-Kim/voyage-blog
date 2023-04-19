const express = require("express");
const router = express.Router();
const postsRouter = require("./posts.js");
const usersRouter = require("./users.js");
const commentsRouter = require("./comments.js");

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: 사용자 관련 CRUD
 */
router.use("/users", [usersRouter]);

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: 게시물 관련 CRUD
 */
router.use("/posts", [postsRouter]);

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: 댓글 관련 CRUD
 */
router.use("/posts/:_postId/comments", [commentsRouter]);

module.exports = router;