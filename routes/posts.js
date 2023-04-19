const express = require("express");
const router = express.Router();
const Posts = require("../schemas/posts.js");
const Comments = require("../schemas/comments.js");
const Users = require("../schemas/users.js");
const authMiddleware = require("../middlewares/auth-middleware");

// POST: 게시글 작성 API
// - 토큰을 검사하여, 유효한 토큰일 경우에만 게시글 작성 가능
// - 제목, 작성 내용을 입력하기
router.post("/", authMiddleware, async (req, res) => {
	const { userId } = res.locals.user;
	const { title, content } = req.body;

	if (!title || !content)
		return res.status(412).json({
			errorMessage: "데이터 형식이 올바르지 않습니다.",
		});
	if (typeof title !== "string")
		return res.status(412).json({
			errorMessage: "게시글 제목의 형식이 일치하지 않습니다.",
		});
	if (typeof content !== "string")
		return res.status(412).json({
			errorMessage: "게시글 내용의 형식이 일치하지 않습니다.",
		});

	try {
		const existingUser = await Users.findById(userId);
		const nickname = existingUser.nickname;
		await Posts.create({ nickname, title, content, userId });
		res.status(201).json({ message: "게시글을 작성에 성공하였습니다." });
	} catch (error) {
		console.error(error);
		res.status(500).json({ errorMessage: "게시글 작성에 실패하였습니다." });
	}
});

// GET: 전체 게시글 목록 조회 API
// - 제목, 작성자명(nickname), 작성 날짜를 조회하기
// - 작성 날짜 기준으로 내림차순 정렬하기
router.get("/", async (req, res) => {
	try {
		const allPosts = await Posts.find({})
			.sort({ createdAt: "desc" })
			.populate("userId").exec();

		let posts = allPosts.map((post) => ({
			postId: post._id,
			userId: post.userId,
			nickname: post.nickname,
			title: post.title,
			createdAt: post.created_at,
			updatedAt: post.updated_at,
		}));
		res.status(200).json({ posts });
	} catch (error) {
		console.error(error);
		res.status(500).json({ errorMessage: "게시글 조회에 실패하였습니다." });
	}
});

// GET: 게시글 조회 API
// - 제목, 작성자명(nickname), 작성 날짜, 작성 내용을 조회하기
// (검색 기능이 아닙니다. 간단한 게시글 조회만 구현해주세요.)
router.get("/:_postId", async (req, res) => {
	const { _postId } = req.params;

	try {
		const targetPost = await Posts.findOne({ _id: _postId }).exec();
		let post = {
			postId: targetPost._id,
			userId: targetPost.userId,
			nickname: targetPost.nickname,
			title: targetPost.title,
			content: targetPost.content,
			createdAt: targetPost.created_at,
			updatedAt: targetPost.updated_at,
		};
		res.status(200).json({ post });
	} catch (error) {
		console.error(error);
		res.status(500).json({ errorMessage: "게시글 조회에 실패하였습니다." });
	}
});

// PUT: 게시글 수정 API
// - 토큰을 검사하여, 해당 사용자가 작성한 게시글만 수정 가능
router.put("/:_postId", authMiddleware, async (req, res) => {
	const { userId } = res.locals.user;
	const { title, content } = req.body;
	const { _postId } = req.params;

	if (!title || !content)
		return res
			.status(412)
			.json({ errorMessage: "데이터 형식이 올바르지 않습니다." });
	if (typeof title !== "string")
		return res
			.status(412)
			.json({ errorMessage: "게시글 제목의 형식이 올바르지 않습니다." });
	if (typeof content !== "string")
		return res
			.status(412)
			.json({ errorMessage: "게시글 내용의 형식이 올바르지 않습니다." });

	try {
		const existingPost = await Posts.findOne({ userId, _id: _postId }).exec();
		if (!existingPost)
			return res.status(403).json({
				errorMessage: "게시글 수정의 권한이 존재하지 않습니다.",
			});
		try {
			await Posts.updateOne(
				{ userId, _id: _postId },
				{ $set: { title, content } }
			);
			res.status(200).json({ message: "게시글을 수정하였습니다." });
		} catch (error) {
			console.error(error);
			return res.status(401).json({
				errorMessage: "게시글이 정상적으로 수정되지 않았습니다.",
			});
		}
	} catch (error) {
		console.error(error);
		res.status(500).json({ errorMessage: "게시글 수정에 실패하였습니다." });
	}
});

// DELETE: 게시글 삭제 API
// - 토큰을 검사하여, 해당 사용자가 작성한 게시글만 삭제 가능
router.delete("/:_postId", authMiddleware, async (req, res) => {
	const { userId } = res.locals.user;
	const { _postId } = req.params;

	try {
		const existingPost = await Posts.findOne({ _id: _postId }).exec();
		if (existingPost) {
			if (existingPost.userId.toString() !== userId) {
				return res.status(403).json({
					errorMessage: "게시글의 삭제 권한이 존재하지 않습니다.",
				});
			}
			try {
				await Posts.deleteOne({ userId, _id: _postId });
				await Comments.deleteMany({ userId, postId: _postId }); // 게시글의 comments들도 삭제
				res.status(200).json({
					message: "게시글을 삭제하였습니다.",
				});
			} catch (error) {
				console.error(error);
				return res.status(401).json({
					errorMessage: "게시글이 정상적으로 삭제되지 않았습니다.",
				});
			}
		} else {
			return res.status(404).json({
				errorMessage: "게시글이 존재하지 않습니다.",
			});
		}
	} catch (error) {
		console.error(error);
		res.status(500).json({ errorMessage: "게시글 삭제에 실패하였습니다." });
	}
});

module.exports = router;
