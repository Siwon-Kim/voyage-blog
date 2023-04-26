const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const salt = 10
const { UserService, RedisClientService } = require("../services/users.service");
const { signupSchema, loginSchema } = require("./joi");
require("dotenv").config();

class UserController {
	userService = new UserService();
	redisClient = new RedisClientService();

	// POST: 회원 가입 API
	signup = async (req, res, next) => {
		const { nickname, password } = await signupSchema
			.validateAsync(req.body)
			.catch((error) => {
				console.error(error);
				throw new Error(`412/${error}`);
			});

		try {
			const existingUser = await this.userService.findUser(nickname);
			if (existingUser) throw new Error("412/중복된 닉네임입니다.");

			const hashedPassword = await bcrypt.hash(password, salt)
			
			await this.userService.createAccount(nickname, hashedPassword);
			res.status(201).json({ message: "회원 가입에 성공하였습니다." });
		} catch (error) {
			console.error(error);
			throw new Error(error.message || "400/요청한 데이터 형식이 올바르지 않습니다.");
		}
	};

	// POST: 로그인 API
	login = async (req, res, next) => {
		const { nickname, password } = await loginSchema
			.validateAsync(req.body)
			.catch((err) => {
				console.error(error);
				throw new Error(`412/${err}`);
			});

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
			return res.status(200).json({ message: "Token이 정상적으로 발급되었습니다." });
		} catch (error) {
			console.error(error);
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
