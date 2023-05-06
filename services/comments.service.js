const CommentRepository = require("../repositories/comments.repository");
const PostRepository = require("../repositories/posts.repository");

class CommentService {
	commentRepository = new CommentRepository();
	postRepository = new PostRepository();

	createComment = async (postId, nickname, userId, comment) => {
		const existingPost = await this.postRepository.findByPostId(postId);
		if (!existingPost) throw new Error("404/게시글이 존재하지 않습니다.");

		await this.commentRepository.createComment(postId, nickname, userId, comment);
	};

	findAllComments = async (postId) => {
		const existingPost = await this.postRepository.findByPostId(postId);
		if (!existingPost) throw new Error("404/게시글이 존재하지 않습니다.");

		const comments = await this.commentRepository.findAllByPostId(postId);
		if (comments.length === 0) throw new Error("404/댓글이 존재하지 않습니다.");

		return comments.map((comment) => ({
			commentId: comment.commentId,
			userId: comment.UserId,
			nickname: comment.nickname,
			comment: comment.comment,
			createdAt: comment.createdAt,
			updatedAt: comment.updatedAt,
		}));
	};

	findComment = async (commentId) => {
		const comment = await this.commentRepository.findByCommentId(commentId);

		return comment;
	};

	updateComment = async (postId, userId, comment, commentId) => {
		const existingPost = await this.postRepository.findOneByPostId(postId);
		if (!existingPost) throw new Error("404/게시글이 존재하지 않습니다.");

		const existingComment = await this.commentRepository.findOneByCommentId(commentId);
		if (!existingComment) throw new Error("404/댓글이 존재하지 않습니다.");

		if (existingComment.UserId !== userId)
			throw new Error("403/댓글의 수정 권한이 존재하지 않습니다.");

		await this.commentRepository.update(comment, commentId).catch((error) => {
			throw new Error("400/댓글 수정이 정상적으로 처리되지 않았습니다.");
		});
	};

	deleteComment = async (postId, userId, commentId) => {
		const existingPost = await this.postRepository.findOneByPostId(postId);
		if (!existingPost) throw new Error("404/게시글이 존재하지 않습니다.");

		const existingComment = await this.commentRepository.findOneByCommentId(commentId);
		if (!existingComment) throw new Error("404/댓글이 존재하지 않습니다.");

		if (existingComment.UserId !== userId)
			throw new Error("403/댓글의 삭제 권한이 존재하지 않습니다.");

		await this.commentRepository.remove(commentId).catch((error) => {
            throw new Error("400/댓글 삭제가 정상적으로 처리되지 않았습니다.");
        });
	};
}

module.exports = CommentService;
