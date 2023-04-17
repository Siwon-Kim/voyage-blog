const mongoose = require("mongoose");

const postsSchema = new mongoose.Schema({
	// postId: {
	// 	type: mongoose.Schema.Types.ObjectId,
	// 	required: true,
	// 	default: ObjectId()
	// },
	user: {
		type: String,
		required: true,
	},
	password: {
		type: String,
		required: true,
		unique: true,
	},
	title: {
		type: String,
		required: true,
	},
	content: {
		type: String,
		required: true,
	},
	createdAt: {
		type: Date,
		required: true,
		default: Date.now,
	},
});

module.exports = mongoose.model("Posts", postsSchema);
