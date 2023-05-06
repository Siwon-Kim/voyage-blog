const { Comments } = require("../models");

class CommentRepository {
	create = async (postId, nickname, userId, comment) => {
		await Comments.create({
			PostId: postId,
			nickname,
			UserId: userId,
			comment,
		});
	};

	findAllByPostId = async (postId) => {
		const comments = await Comments.findAll({
			where: { PostId: postId },
			order: [["createdAt", "DESC"]],
		});
		return comments;
	};

	findOneByCommentId = async (commentId) => {
		const comment = await Comments.findOne({
			where: { commentId },
		});
		return comment;
	};

	update = async (comment, commentId) => {
		await Comments.update(
			{ comment },
			{
				where: { commentId },
			}
		);
	};

	remove = async (commentId) => {
		await Comments.destroy({
			where: { commentId },
		})
	};
}

module.exports = CommentRepository;
