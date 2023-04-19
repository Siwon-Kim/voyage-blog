const mongoose = require("mongoose");

const commentsSchema = new mongoose.Schema(
	{
		postId: {
			type: String,
			required: true,
		},
		user: {
			type: String,
			required: true,
		},
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
		},
		content: {
			type: String,
			required: true,
		},
	},
	{ timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

module.exports = mongoose.model("Comments", commentsSchema);
