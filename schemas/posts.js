const mongoose = require("mongoose");
const Users = require("./users");

const postsSchema = new mongoose.Schema(
	{
		nickname: {
			type: String,
			required: true,
		},
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
		},
		title: {
			type: String,
			required: true,
		},
		content: {
			type: String,
			required: true,
		},
	},
	{ timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

// postsSchema.virtual("userId", {
// 	ref: Users,
// 	localField: '_id',
// 	foreignField: 'userId',
// 	justOne: true,
// });

// postsSchema.set("toJSON", {
// 	virtuals: true,
// });

module.exports = mongoose.model("Posts", postsSchema);
