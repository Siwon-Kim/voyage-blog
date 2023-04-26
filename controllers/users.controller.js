const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { UserService, RedisClientService } = require("../services/users.service");

require("dotenv").config();

class UserController {
	userService = new UserService();
	redisClient = new RedisClientService();

	// POST: 회원 가입 API
	signup = async (req, res, next) => {
		const { nickname, password, confirmedPassword } = req.body;

		if (typeof nickname !== "string")
			throw new Error("412/닉네임의 형식이 일치하지 않습니다.");

		if (password !== confirmedPassword)
			throw new Error("412/패스워드가 일치하지 않습니다.");

		if (password.length < 4 || typeof password !== "string")
			throw new Error("412/패스워드 형식이 일치하지 않습니다.");

		if (password.includes(nickname.toLowerCase()))
			throw new Error("412/패스워드에 닉네임이 포함되어 있습니다.");

		const nickNameRegex = new RegExp("^[a-zA-z0-9]{3,}$", "g");
		if (!nickNameRegex.test(nickname))
			throw new Error("412/닉네임의 형식이 일치하지 않습니다.");

		try {
			const existingUser = await this.userService.findUser(nickname);
			if (existingUser) throw new Error("412/중복된 닉네임입니다.");

			const hashedPassword = bcrypt.hash(password, process.env.SALT);
			await this.userService.createAccount(nickname, hashedPassword);
			res.status(201).json({ message: "회원 가입에 성공하였습니다." });
		} catch (error) {
			throw new Error(
				error.message || "400/요청한 데이터 형식이 올바르지 않습니다."
			);
		}
	};

	// POST: 로그인 API
	login = async (req, res, next) => {
		const { nickname, password } = req.body;

		if (typeof nickname !== "string" || typeof password !== "string")
			throw new Error("412/닉네임 또는 패스워드를 확인해주세요.");

		try {
			const existingUser = await this.userService.findUser(nickname);
			let validInput = false;
			if (existingUser) {
				const hashedPassword = existingUser.password;
				const matchingPassword = await bcrypt.compare(password, hashedPassword);
				if (matchingPassword) validInput = true;
			}

			if (!validInput) throw new Error("412/닉네임 또는 패스워드를 확인해주세요.");

			const userId = existingUser.userId;
			const accessToken = createAccessToken(userId);
			const refreshToken = createRefreshToken();

			await this.redisClient.setRefreshToken(refreshToken, userId);

			res.cookie("accessToken", `Bearer ${accessToken}`);
			res.cookie("refreshToken", `Bearer ${refreshToken}`);
			return res
				.status(200)
				.json({ message: "Token이 정상적으로 발급되었습니다." });
		} catch (error) {
			throw new Error(error.message || "400/로그인에 실패하였습니다.");
		}
	};
}

function createAccessToken(userId) {
	const accessToken = jwt.sign({ userId }, process.env.SECRET_KEY, {
		expiresIn: "2h",
	});
	return accessToken;
}

function createRefreshToken() {
	const refreshToken = jwt.sign({}, process.env.SECRET_KEY, {
		expiresIn: "7d",
	});
	return refreshToken;
}

module.exports = { UserController };
