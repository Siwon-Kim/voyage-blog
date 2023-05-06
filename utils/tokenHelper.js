const jwt = require("jsonwebtoken");
const { config } = require("../config/config");

class TokenHelper {
	createAccessToken(userId) {
		const accessToken = jwt.sign({ userId }, config.jwt.secretKey, {
			expiresIn: config.jwt.accessExpiresIn,
		});
		return accessToken;
	}

	createRefreshToken() {
		const refreshToken = jwt.sign({}, config.jwt.secretKey, {
			expiresIn: config.jwt.refreshExpiresIn,
		});
		return refreshToken;
	}

	validateAccessToken(accessToken) {
		try {
			jwt.verify(accessToken, config.jwt.secretKey);
			return true;
		} catch (error) {
			return false;
		}
	}

	validateRefreshToken(refreshToken) {
		try {
			jwt.verify(refreshToken, config.jwt.secretKey);
			return true;
		} catch (error) {
			return false;
		}
	}

	getAccessTokenPayload(accessToken) {
		try {
			const payload = jwt.verify(accessToken, config.jwt.secretKey);
			return payload;
		} catch (error) {
			return null;
		}
	}
}

module.exports = TokenHelper;
