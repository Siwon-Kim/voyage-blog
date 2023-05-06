const { Users } = require("../models");
const redis = require("redis");
const { config } = require("../config/config");

class UserRepository {
	findByNickname = async (nickname) => {
		const user = await Users.findOne({
			where: { nickname },
		});

		return user;
	};

	findById = async (userId) => {
		const user = await Users.findOne({ where: { userId } });

		return user;
	};

	createAccount = async (nickname, hashedPassword) => {
		await Users.create({ nickname, password: hashedPassword });
	};
}

class RedisClientRepository {
	constructor() {
		this.redisClient = redis.createClient({
			url: `redis://${config.redis.username}:${config.redis.password}@${config.redis.host}:${config.redis.port}/0`,
			legacyMode: true,
		});

		this.redisConnected = false;
	}

	initialize = async () => {
		this.redisClient.on("connect", () => {
			this.redisConnected = true;
			console.info("Redis connected!");
		});
		this.redisClient.on("error", (err) => {
			console.error("Redis Client Error", err);
		});
		if (!this.redisConnected) this.redisClient.connect().then(); // redis v4 연결 (비동기)
	};

	setRefreshToken = async (refreshToken, userId) => {
		await this.initialize();
		await this.redisClient.v4.set(refreshToken, userId);
	};

	getRefreshToken = async (refreshToken) => {
		await this.initialize();
		const token = await this.redisClient.v4.get(refreshToken);
		return token;
	};

	deleteRefreshToken = async (refreshToken) => {
		await this.initialize();
		await this.redisClient.v4.del(refreshToken);
	};
}

module.exports = { UserRepository, RedisClientRepository };
