const { Posts } = require("../models");
const { Op } = require("sequelize");

class PostRepository {
	findAll = async () => {
		const posts = await Posts.findAll({ order: [["createdAt", "DESC"]] });

		return posts;
	};

	create = async (nickname, userId, title, content) => {
		await Posts.create({
			nickname,
			UserId: userId,
			title,
			content,
		});
	};

	findOneByPostId = async (postId) => {
		const post = await Posts.findByPk(postId);

		return post;
	};

	findOneByIds = async (userId, postId) => {
		const post = await Posts.findOne({
			where: { [Op.and]: [{ postId }, { UserId: userId }] },
		});

		return post;
	};

	update = async (title, content, postId, userId) => {
		await Posts.update(
			{ title, content },
			{ where: { [Op.and]: [{ postId }, { UserId: userId }] } }
		);
	};

	remove = async (postId, userId) => {
		await Posts.destroy({
			where: {
				[Op.and]: [{ postId }, { UserId: userId }],
			},
		});
	};
}

module.exports = PostRepository;
