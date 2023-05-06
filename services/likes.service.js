const LikeRepository = require("../repositories/likes.repository");
const PostRepository = require("../repositories/posts.repository");

class LikeService {
	likeRepository = new LikeRepository();
    PostRepository = new PostRepository();

	findLikedPosts = async (userId) => {
		const likedPosts = await this.likeRepository.findAllByUserId(userId);

		if (likedPosts.length === 0)
			throw new Error("404/아직 좋아요를 누른 게시글이 없습니다.");

		return likedPosts.map((post) => ({
			postId: post.Post.postId,
			userId: post.Post.UserId,
			nickname: post.Post.nickname,
			title: post.Post.title,
			createdAt: post.Post.createdAt,
			updatedAt: post.Post.updatedAt,
			likes: post.Post.like,
		}));
	};

	clickLike = async (userId, postId) => {
		const existingPost = await this.PostRepository.findOneByPostId(postId);
		if (!existingPost) throw new Error("404/게시글이 존재하지 않습니다.");

		const existingLike = await this.likeRepository.findOneByIds(postId, userId);
		
        if (!existingLike) {
			await this.likeRepository.create(userId, postId);
			return 1;
		} else {
			await this.likeRepository.remove(userId, postId);
			return 0;
		}
	};
}

module.exports = LikeService;
