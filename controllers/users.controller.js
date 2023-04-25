const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const redis = require("redis");
const salt = 12;
const SECRET_KEY = "secretkeyforvoyageblog";
const UserService = require("../services/users.service");

class RedisClient {
	constructor() {
		this.client = null;
	}

	initialize(callback) {
		this.client = redis.createClient();
		this.client.on('ready', () => {
			callback();
		})
	}

	get endpoint() {
		return this.client;
	}

	setValue(key, value) {
		this.client.set(key, value);
	}

	async getValue() {
		return new Promise((resolve, reject) => {
			this.client.get(key, (err, value) => {
				if (err) reject(err);
				resolve(value);
			});
		});
	}
}

class UserController {
	userService = new UserService();
	redisClient = new RedisClient();

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

			const hashedPassword = await bcrypt.hash(password, salt);
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
				const matchingPassword = await bcrypt.compare(
					password,
					hashedPassword
				);
				if (matchingPassword) validInput = true;
			}

			if (!validInput)
				throw new Error("412/닉네임 또는 패스워드를 확인해주세요.");

			const userId = existingUser.userId;
			const accessToken = createAccessToken(userId);
			const refreshToken = createRefreshToken();

			this.redisClient.initialize(() => {
				this.redisClient.setValue(userId, refreshToken);
			})
			
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

function createAccessToken(id) {
	const accessToken = jwt.sign({ id }, SECRET_KEY, { expiresIn: "10s" });
	return accessToken;
}

function createRefreshToken() {
	const refreshToken = jwt.sign({}, SECRET_KEY, { expiresIn: "7d" });
	return refreshToken;
}

module.exports = {
	UserController,
	RedisClient,
};
