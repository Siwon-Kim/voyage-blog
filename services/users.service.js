const bcrypt = require("bcrypt");
const { config } = require("../config/config");
const { TokenHelper } = require("../utils/tokenHelper");
const { UserRepository, RedisClientRepository } = require("../repositories/users.repository");

class UserService {
	userRepository = new UserRepository();
	redisClientRepository = new RedisClientRepository();
	
	createAccount = async (nickname, password) => {
		const existingUser = await this.userRepository.findByNickname(nickname);
		if (existingUser) throw new Error("412/중복된 닉네임입니다.");

		const hashedPassword = await bcrypt.hash(password, config.bcrypt.saltRounds);
		await this.userRepository.createAccount(nickname, hashedPassword);
	};

	login = async (nickname, password) => {
		const tokenHelper = new TokenHelper();
		const existingUser = await this.userRepository.findByNickname(nickname);
		let validInput = false;
		if (existingUser) {
			const hashedPassword = existingUser.password;
			const matchingPassword = await bcrypt.compare(password, hashedPassword);
			if (matchingPassword) validInput = true;
		}
		if (!validInput) throw new Error("412/닉네임 또는 패스워드를 확인해주세요.");

		const userId = existingUser.userId;
		const accessToken = tokenHelper.createAccessToken(userId);
		const refreshToken = tokenHelper.createRefreshToken();
		await this.redisClientRepository.setRefreshToken(refreshToken, userId);
		return { accessToken, refreshToken };
	};
}

module.exports = UserService;
