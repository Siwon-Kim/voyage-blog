const PostRepository = require("../repositories/posts.repository");

class PostService {
	postRepository = new PostRepository();

	createPost = async (nickname, userId, title, content) => {
		await this.postRepository.createPost(nickname, userId, title, content);
	};

	findAllPost = async () => {
		const allPosts = await this.postRepository.findAllPost();
		if (allPosts.length === 0) throw new Error("404/게시글이 존재하지 않습니다.");

		return allPosts.map((post) => ({
			postId: post.postId,
			userId: post.UserId,
			nickname: post.nickname,
			title: post.title,
			createdAt: post.createdAt,
			updatedAt: post.updatedAt,
			likes: post.like,
		}));
	};

	findPostById = async (postId) => {
		const post = await this.postRepository.findPostById(postId);
		if (!post) throw new Error("404/게시글이 존재하지 않습니다.");

		return post === null
			? 0
			: {
					postId: post.postId,
					userId: post.UserId,
					nickname: post.nickname,
					title: post.title,
					content: post.content,
					createdAt: post.createdAt,
					updatedAt: post.updatedAt,
					likes: post.like,
			  };
	};

	findPost = async (userId, postId) => {
		const post = await this.postRepository.findPost(userId, postId);

		return post;
	};

	updatePost = async (title, content, postId, userId) => {
		const post = await this.postRepository.findPost(userId, postId);
		if (!post) throw new Error("403/게시글 수정의 권한이 존재하지 않습니다.");

		await this.postRepository.updatePost(title, content, postId, userId).catch((error) => {
			throw new Error("401/게시글이 정상적으로 수정되지 않았습니다.");
		});
	};

	deletePost = async (postId, userId) => {
		const existingPost = await this.postRepository.findPostById(postId);
		if (!existingPost) {
			throw new Error("404/게시글이 존재하지 않습니다.");
		}
		if (existingPost.UserId !== userId)
			throw new Error("403/게시글의 삭제 권한이 존재하지 않습니다.");

		await this.postRepository.deletePost(postId, userId).catch((error) => {
			throw new Error("401/게시글이 정상적으로 삭제되지 않았습니다.");
		});
	};
}

module.exports = PostService;
