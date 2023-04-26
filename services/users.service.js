const {
	UserRepository,
	RedisClientRepository,
} = require("../repositories/users.repository");

class UserService {
	userRepository = new UserRepository();

	findUser = async (nickname) => {
		const user = await this.userRepository.findUser(nickname);

		return user;
	};

	createAccount = async (nickname, hashedPassword) => {
		await this.userRepository.createAccount(nickname, hashedPassword);
	};
}

class RedisClientService {
	redisClientRepository = new RedisClientRepository();

	async initialize() {
		await this.redisClientRepository.initialize();
	}

	setRefreshToken = async (refreshToken, userId) => {
		await this.redisClientRepository.setRefreshToken(refreshToken, userId);
	};

	getRefreshToken = async (refreshToken) => {
		const token = await this.redisClientRepository.getRefreshToken(refreshToken);

		return token;
	};

	deleteRefreshToken = async (refreshToken) => {
		await this.redisClientRepository.deleteRefreshToken(refreshToken);
	};
}

module.exports = { UserService, RedisClientService };
