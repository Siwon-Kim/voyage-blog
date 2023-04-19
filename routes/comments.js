const express = require("express");
const router = express.Router();
const Comments = require("../schemas/comments.js");
const Users = require("../schemas/users.js");
const authMiddleware = require("../middlewares/auth-middleware");

// POST: 댓글 작성 API
// - 로그인 토큰을 검사하여, 유효한 토큰일 경우에만 댓글 작성 가능
// - 댓글 내용을 비워둔 채 댓글 작성 API를 호출하면 "댓글 내용을 입력해주세요" 라는 메세지를 return하기
// - 댓글 내용을 입력하고 댓글 작성 API를 호출한 경우 작성한 댓글을 추가하기
router.post("/:_postId/comments", authMiddleware, async (req, res) => {
	const { userId } = res.locals.user;
	const { user, password, content } = req.body;
	const { _postId } = req.params;
	if (!content) {
		return res.status(400).json({
			errorMessage: "댓글 내용을 입력해주세요.",
		});
	}
	if (
		typeof user !== "string" ||
		typeof password !== "string" ||
		typeof content !== "string" ||
		!_postId
	) {
		return res.status(400).json({
			errorMessage: "데이터 형식이 올바르지 않습니다.",
		});
	}

	try {
		await Comments.create({ postId: _postId, user, password, content });
		res.status(201).json({ message: "댓글을 생성하였습니다." });
	} catch (error) {
		res.status(500).json({ error });
	}
});

// GET: 댓글 목록 조회 API
// - 조회하는 게시글에 작성된 모든 댓글을 목록 형식으로 볼 수 있도록 하기
// - 작성 날짜 기준으로 내림차순 정렬하기
router.get("/:_postId/comments", async (req, res) => {
	const { _postId } = req.params;
    if(!_postId) {
        return res.status(400).json({
			errorMessage: "데이터 형식이 올바르지 않습니다.",
		});
    }
    
    try {
		const comments = await Comments.find({ postId: _postId }).sort({
			createdAt: "desc",
		});
		let data = comments.map((comment) => ({
			commentId: comment._id,
			user: comment.user,
			content: comment.content,
			createdAt: comment.createdAt,
		}));
		res.status(200).json({ data });
	} catch (error) {
		res.status(500).json({ error });
	}
});

// PUT: 댓글 수정 API
// - 로그인 토큰을 검사하여, 해당 사용자가 작성한 댓글만 수정 가능
// - 댓글 내용을 비워둔 채 댓글 수정 API를 호출하면 "댓글 내용을 입력해주세요" 라는 메세지를 return하기
// - 댓글 내용을 입력하고 댓글 수정 API를 호출한 경우 작성한 댓글을 수정하기
router.put("/:_postId/comments/:_commentId", authMiddleware, async (req, res) => {
	const { userId } = res.locals.user;
	const { password, content } = req.body;
	const { _postId, _commentId } = req.params;
	if (!content) {
		return res.status(400).json({
			errorMessage: "댓글 내용을 입력해주세요.",
		});
	}
	if (
		typeof password !== "string" ||
		typeof content !== "string" ||
		!_postId ||
		!_commentId
	) {
		return res.status(400).json({
			errorMessage: "데이터 형식이 올바르지 않습니다.",
		});
	}

	try {
		const existingComment = await Comments.find({ password });
		if (existingComment.length) {
			await Comments.updateOne({ password }, { $set: { content } });
			res.status(200).json({ message: "댓글을 수정하였습니다." });
		} else {
			res.status(404).json({
				errorMessage: "댓글 조회에 실패하였습니다.",
			});
		}
	} catch (error) {
		res.status(500).json({ error });
	}
});

// DELETE: 댓글 삭제 API
// - 로그인 토큰을 검사하여, 해당 사용자가 작성한 댓글만 삭제 가능
// - 원하는 댓글을 삭제하기
router.delete("/:_postId/comments/:_commentId", authMiddleware, async (req, res) => {
	const { userId } = res.locals.user;
	const { password } = req.body;
	const { _postId, _commentId } = req.params;
	if (typeof password !== "string" || !_postId || !_commentId) {
		return res.status(400).json({
			errorMessage: "데이터 형식이 올바르지 않습니다.",
		});
	}

	try {
		const existingComment = await Comments.find({ password });
		if (existingComment.length) {
			await Comments.deleteOne({ password });
			res.status(200).json({ message: "댓글을 삭제하였습니다." });
		} else {
			res.status(404).json({
				errorMessage: "댓글 조회에 실패하였습니다.",
			});
		}
	} catch (error) {
		res.status(500).json({ error });
	}
});

module.exports = router;
