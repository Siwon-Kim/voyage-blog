const { Posts, Likes } = require("../models");
const { Op } = require("sequelize");
const { Transaction } = require("sequelize");
const { sequelize } = require("../models");

class LikeRepository {
	findLikedPosts = async (userId) => {
		const likedPosts = await Likes.findAll({
			include: [
				{
					model: Posts,
					attributes: [
						"postId",
						"UserId",
						"nickname",
						"title",
						"createdAt",
						"updatedAt",
						"like",
					],
				},
			],
			where: { UserId: userId },
			attributes: [],
			order: [[Posts, "like", "DESC"]],
		});

		return likedPosts;
	};

	findPostById = async (postId) => {
		const post = await Posts.findByPk(postId);

		return post;
	};

	findLike = async (postId, userId) => {
		const getLike = await Likes.findOne({
			where: {
				[Op.and]: [{ PostId: postId }, [{ userId: userId }]],
			},
		});

		return getLike;
	};

	createLike = async (userId, postId) => {
		const t = await sequelize.transaction({
			isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
		});
		try {
			await Likes.create(
				{ UserId: userId, PostId: postId },
				{
					transaction: t,
				}
			);
			await Posts.increment("like", { where: { postId }, transaction: t });
			await t.commit();
		} catch (error) {
			await t.rollback();
		}
	};

	deleteLike = async (userId, postId) => {
		const t = await sequelize.transaction({
			isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
		});
		try {
			await Likes.destroy(
				{
					where: {
						[Op.and]: [{ postId }, [{ userId }]],
					},
				},
				{
					transaction: t,
				}
			);
			await Posts.decrement("like", { where: { postId }, transaction: t });
			await t.commit();
		} catch (error) {
			await t.rollback();
		}
	};
}

module.exports = LikeRepository;
