const { Posts } = require("../models");
const { Op } = require("sequelize");

class PostRepository {
	findAllPost = async () => {
		const posts = await Posts.findAll({ order: [["createdAt", "DESC"]] });

		return posts;
	};

	createPost = async (nickname, userId, title, content) => {
		await Posts.create({
			nickname,
			UserId: userId,
			title,
			content,
		});
	};

	findPostById = async (postId) => {
		const post = await Posts.findByPk(postId);

		return post;
	};

	findPost = async (userId, postId) => {
		const post = await Posts.findOne({
			where: { [Op.and]: [{ postId }, { UserId: userId }] },
		});

		return post;
	};

	updatePost = async (title, content, postId, userId) => {
		await Posts.update(
			{ title, content },
			{ where: { [Op.and]: [{ postId }, { UserId: userId }] } }
		);
	};

	deletePost = async (postId, userId) => {
		await Posts.destroy({
			where: {
				[Op.and]: [{ postId }, { UserId: userId }],
			},
		});
	};
}

module.exports = PostRepository;
