const express = require("express");
const app = express();
const port = 3000;

const commentsRouter = require("./routes/comments.js");
const postsRouter = require("./routes/posts.js");
const connect = require("./schemas");
connect();

app.use(express.json()); 

app.get("/", (req, res) => {
	res.send("APIs for Voyage Blog");
});

app.use("/api", [postsRouter, commentsRouter]);

app.listen(port, () => {
	console.log(port, `Server running on ${port} port`);
});