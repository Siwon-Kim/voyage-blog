const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const port = 3001;

const mainRouter = require("./routes/index.js");
const connect = require("./schemas");
connect();

app.use(express.json()); 
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.get("/", (req, res) => {
	res.send("APIs for Voyage Blog");
});

app.use("/", [mainRouter]);


app.listen(port, () => {
	console.log(port, `Server running on ${port} port`);
});