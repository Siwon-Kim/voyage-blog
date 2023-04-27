const PostService = require("../services/posts.service");
const LikeService = require("../services/likes.service");
const { postSchema } = require("./joi");

class PostController {
	postService = new PostService();
	likeService = new LikeService();

	// POST: 게시글 작성 API
	createPost = async (req, res, next) => {
		try {
			const { userId, nickname } = res.locals.user;
			const { title, content } = await postSchema
				.validateAsync(req.body)
				.catch((error) => {
					throw new Error(`412/${error}`);
				});

			await this.postService.createPost(nickname, userId, title, content);
			res.status(201).json({
				message: "게시글을 작성에 성공하였습니다.",
			});
		} catch (error) {
			console.error(`${req.method} ${req.originalUrl} : ${error.message}`);
			throw new Error(error.message || "400/게시글 작성에 실패하였습니다.");
		}
	};

	// GET: 전체 게시글 목록 조회 API
	getAllPosts = async (req, res, next) => {
		try {
			const posts = await this.postService.findAllPost();
			res.status(200).json({ posts });
		} catch (error) {
			console.error(`${req.method} ${req.originalUrl} : ${error.message}`);
			throw new Error(error.message || "400/게시글 조회에 실패하였습니다.");
		}
	};

	// GET: 좋아요한 게시글 조회 API
	getLikedPosts = async (req, res, next) => {
		try {
			const { userId } = res.locals.user;

			const posts = await this.likeService.findLikedPosts(userId);
			res.status(200).json({ posts });
		} catch (error) {
			console.error(`${req.method} ${req.originalUrl} : ${error.message}`);
			throw new Error(error.message || "400/좋아요 게시글 조회에 실패하였습니다.");
		}
	};

	// GET: 게시물 상세 조회 API
	getPost = async (req, res, next) => {
		try {
			const { _postId } = req.params;

			const post = await this.postService.findPostById(_postId);
			res.status(200).json({ post });
		} catch (error) {
			console.error(`${req.method} ${req.originalUrl} : ${error.message}`);
			throw new Error(error.message || "400/게시글 조회에 실패하였습니다.");
		}
	};

	// PUT: 게시글 수정 API
	changePost = async (req, res, next) => {
		try {
			const { userId } = res.locals.user;
			const { _postId } = req.params;
			const { title, content } = await postSchema
				.validateAsync(req.body)
				.catch((error) => {
					throw new Error(`412/${error}`);
				});

			await this.postService.updatePost(title, content, _postId, userId);
			res.status(200).json({ message: "게시글을 수정하였습니다." });
		} catch (error) {
			console.error(`${req.method} ${req.originalUrl} : ${error.message}`);
			throw new Error(error.message || "400/게시글 수정에 실패하였습니다.");
		}
	};

	// DELETE: 게시글 삭제 API
	deletePost = async (req, res, next) => {
		try {
			const { userId } = res.locals.user;
			const { _postId } = req.params;

			await this.postService.deletePost(_postId, userId);
			res.status(200).json({ message: "게시글을 삭제하였습니다." });
		} catch (error) {
			console.error(`${req.method} ${req.originalUrl} : ${error.message}`);
			throw new Error(error.message || "400/게시글 삭제에 실패하였습니다.");
		}
	};

	// POST: 게시글 좋아요 API
	clickLike = async (req, res, next) => {
		try {
			const { _postId } = req.params;
			const { userId } = res.locals.user;

			const like = await this.likeService.clickLike(userId, _postId);

			const message = like
				? "게시글의 좋아요를 등록하였습니다"
				: "게시글의 좋아요를 취소하였습니다.";
			res.status(200).json({ message });
		} catch (error) {
			console.error(`${req.method} ${req.originalUrl} : ${error.message}`);
			throw new Error(error.message || "400/게시글 좋아요에 실패하였습니다.");
		}
	};
}

module.exports = PostController;
