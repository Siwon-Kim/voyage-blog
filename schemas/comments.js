const mongoose = require("mongoose");

const commentsSchema = new mongoose.Schema({
    commentId: {
		type: Number,
		required: true,
		unique: true,
	}
});

module.exports = mongoose.model("Comments", commentsSchema);