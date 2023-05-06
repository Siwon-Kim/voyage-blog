require("dotenv").config();

function required(key, defaultValue = undefined) {
	const value = process.env[key] || defaultValue;
	if (value == null) {
		throw new Error(`Key ${key} is undefined`);
	}
	return value;
}

const config = {
	jwt: {
		secretKey: required("SECRET_KEY"),
		refreshExpiresIn: required("REFRESH_EXPIRES", "7d"),
		accessExpiresIn: required("ACCESS_EXPIRES", "2h"),
	},
	bcrypt: {
		saltRounds: parseInt(required("BCRYPT_SALT_ROUNDS", 10)),
	},
	host: {
		port: parseInt(required("HOST_PORT", 3000)),
	},
	development: {
		host: required("DB_HOST"),
		username: required("DB_USER"),
		database: required("DB_NAME"),
		password: required("DB_PASSWORD"),
		dialect: required("DB_DIALECT"),
	},
	test: {
		host: required("DB_HOST"),
		username: required("DB_USER"),
		database: required("DB_TEST_NAME"),
		password: required("DB_PASSWORD"),
		dialect: required("DB_DIALECT"),
	},
	redis: {
		host: required("REDIS_HOST"),
		port: parseInt(required("REDIS_PORT", 19231)),
		username: required("REDIS_USERNAME"),
		password: required("REDIS_PASSWORD"),
	},
};

module.exports = { config };