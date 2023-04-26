const jwt = require("jsonwebtoken");
const { Users } = require("../models");
const { RedisClientService } = require("../services/users.service");

module.exports = async (req, res, next) => {
	const accessToken = req.cookies.accessToken;
	const refreshToken = req.cookies.refreshToken;
	let newAccessToken;

	const [authAccessType, authAccessToken] = (accessToken ?? "").split(" ");
	const [authRefreshType, authRefreshToken] = (refreshToken ?? "").split(" ");

	if (authAccessType !== "Bearer" || !authAccessToken) {
		console.error("Refresh Token이 존재하지 않습니다.");
		return res.status(403).json({
			errorMessage: "로그인이 필요한 기능입니다.",
		});
	}

	if (authRefreshType !== "Bearer" || !authRefreshToken) {
		console.error("Access Token이 존재하지 않습니다.");
		return res.status(403).json({
			errorMessage: "로그인이 필요한 기능입니다.",
		});
	}

	const isAccessTokenValid = validateAccessToken(authAccessToken);
	const isRefreshTokenValid = validateRefreshToken(authRefreshToken);

	try {
		const redisClient = new RedisClientService();

		if (!isRefreshTokenValid) {
			await redisClient.deleteRefreshToken(authRefreshToken);
			return res.status(419).json({ message: "Refresh Token이 만료되었습니다." });
		}

		if (!isAccessTokenValid) {
			const accessTokenId = await redisClient.getRefreshToken(authRefreshToken);
			if (!accessTokenId)
				return res.status(419).json({
					message: "Refresh Token의 정보가 서버에 존재하지 않습니다.",
				});

			newAccessToken = createAccessToken(accessTokenId);
			res.cookie("accessToken", `Bearer ${newAccessToken}`);
			return res.json({
				message: "Access Token을 새롭게 발급하였습니다. 다시 시도하십시오.",
			});
		}
		const { userId } = getAccessTokenPayload(authAccessToken);

		const user = await Users.findOne({ where: { userId } });
		res.locals.user = user;

		next();
	} catch (error) {
		console.error(error);
		return res.status(403).json({
			// 쿠키가 비정상적이거나 만료된 경우
			errorMessage: "전달된 쿠키에서 오류가 발생하였습니다.",
		});
	}
};

function createAccessToken(userId) {
	const accessToken = jwt.sign({ userId }, process.env.SECRET_KEY, {
		expiresIn: "2h",
	});
	return accessToken;
}

function validateAccessToken(accessToken) {
	try {
		jwt.verify(accessToken, process.env.SECRET_KEY);
		return true;
	} catch (error) {
		return false;
	}
}

function validateRefreshToken(refreshToken) {
	try {
		jwt.verify(refreshToken, process.env.SECRET_KEY);
		return true;
	} catch (error) {
		return false;
	}
}

function getAccessTokenPayload(accessToken) {
	try {
		const payload = jwt.verify(accessToken, process.env.SECRET_KEY);
		return payload;
	} catch (error) {
		return null;
	}
}
