const express = require("express");
const router = express.Router();

const Posts = require("../schemas/posts.js");

// POST: 게시글 작성 API
// - 제목, 작성자명, 비밀번호, 작성 내용을 입력하기
router.post("/posts", async (req, res) => {
	const { user, password, title, content } = req.body;
	if (
		typeof user !== "string" ||
		typeof password !== "string" ||
		typeof title !== "string" ||
		typeof content !== "string"
	) {
		return res.status(400).json({
			errorMessage: "데이터 형식이 올바르지 않습니다.",
		});
	}
	
	try {
		await Posts.create({ user, password, title, content });
		res.status(201).json({ message: "게시글을 생성하였습니다." });
	} catch (error) {
		res.status(500).json({ error });
	}
});

// GET: 전체 게시글 목록 조회 API
// - 제목, 작성자명, 작성 날짜를 조회하기
// - 작성 날짜 기준으로 내림차순 정렬하기
router.get("/posts", async (req, res) => {
	try {
		const posts = await Posts.find({}).sort({ createdAt: "desc" });
		let data = posts.map((post) => ({
			postId: post._id,
			user: post.user,
			title: post.title,
			content: post.content,
			createdAt: post.createdAt,
		}));
		res.status(200).json({ data });
	} catch (error) {
		res.status(500).json({ error });
	}
});

// GET: 게시글 조회 API
// - 제목, 작성자명, 작성 날짜, 작성 내용을 조회하기
// (검색 기능이 아닙니다. 간단한 게시글 조회만 구현해주세요.)
router.get("/posts/:_postId", async (req, res) => {
	const { _postId } = req.params;
	if (!_postId)
		return res
			.status(400)
			.json({ errorMessage: "데이터 형식이 올바르지 않습니다." });

	try {
		const post = await Posts.findOne({ _id: _postId });
		let data = {
			postId: post._id,
			user: post.user,
			title: post.title,
			content: post.content,
			createdAt: post.createdAt,
		};
		res.status(200).json({ data });
	} catch (error) {
		res.status(500).json({ error });
	}
});

// PUT: 게시글 수정 API
// - API를 호출할 때 입력된 비밀번호를 비교하여 동일할 때만 글이 수정되게 하기
router.put("/posts/:_postId", async (req, res) => {
	const { password, title, content } = req.body;
	const { _postId } = req.params;
	if (
		typeof password !== "string" ||
		typeof title !== "string" ||
		typeof content !== "string" ||
		!_postId
	) {
		return res.status(400).json({
			errorMessage: "데이터 형식이 올바르지 않습니다.",
		});
	}

	try {
		const existingPost = await Posts.find({ password });
		if (existingPost.length) {
			await Posts.updateOne({ password }, { $set: { title, content } });
			res.status(200).json({ message: "게시글을 수정하였습니다." });
		} else {
			res.status(404).json({
				errorMessage: "게시글 조회에 실패하였습니다.",
			});
		}
	} catch (error) {
		res.status(500).json({ error });
	}
});

// DELETE: 게시글 삭제 API
// - API를 호출할 때 입력된 비밀번호를 비교하여 동일할 때만 글이 삭제되게 하기
router.delete("/posts/:_postId", async (req, res) => {
	const { password } = req.body;
	const { _postId } = req.params;
	if (typeof password !== "string" || !_postId) {
		return res.status(400).json({
			errorMessage: "데이터 형식이 올바르지 않습니다.",
		});
	}

	try {
		const existingPost = await Posts.find({ password });
		if (existingPost.length) {
			await Posts.deleteOne({ password });
			res.status(200).json({ message: "게시글을 삭제하였습니다." });
		} else {
			res.status(404).json({
				errorMessage: "게시글 조회에 실패하였습니다.",
			});
		}
	} catch (error) {
		res.status(500).json({ error });
	}
});

module.exports = router;
