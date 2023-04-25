const jwt = require("jsonwebtoken");
const SECRET_KEY = "secretkeyforvoyageblog";
const { Users } = require("../models");
// const { RedisClient } = require("../controllers/users.controller");

module.exports = async (req, res, next) => {
	const accessToken = req.cookies.accessToken;
	const refreshToken = req.cookies.refreshToken;

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

	try {
		const isAccessTokenValidate = validateAccessToken(accessToken);
		const isRefreshTokenValidate = validateRefreshToken(refreshToken);

		if (!isRefreshTokenValidate)
			return res
				.status(419)
				.json({ message: "Refresh Token이 만료되었습니다." });

		if (!isAccessTokenValidate) {
			const accessTokenId = tokenObject[refreshToken];
			if (!accessTokenId)
				return res.status(419).json({
					message: "Refresh Token의 정보가 서버에 존재하지 않습니다.",
				});

			const newAccessToken = createAccessToken(accessTokenId);
			res.cookie("accessToken", newAccessToken);
			return res.json({
				message: "Access Token을 새롭게 발급하였습니다.",
			});
		}

		const { userId } = getAccessTokenPayload(accessToken);

		const user = await Users.findOne({ where: { userId } });
		res.locals.user = user;

		res.json({
			message: `${id}의 Payload를 가진 Token이 성공적으로 인증되었습니다.`,
		});

		next();
	} catch (error) {
		console.error(error);
		return res.status(403).json({
			// 쿠키가 비정상적이거나 만료된 경우
			errorMessage: "전달된 쿠키에서 오류가 발생하였습니다.",
		});
	}
};

function createAccessToken(id) {
	const accessToken = jwt.sign({ id }, SECRET_KEY, { expiresIn: "10s" });
	return accessToken;
}

function validateAccessToken(accessToken) {
	try {
		jwt.verify(accessToken, SECRET_KEY);
		return true;
	} catch (error) {
		return false;
	}
}

function validateRefreshToken(refreshToken) {
	try {
		jwt.verify(refreshToken, SECRET_KEY);
		return true;
	} catch (error) {
		return false;
	}
}

function getAccessTokenPayload(accessToken) {
	try {
		const payload = jwt.verify(accessToken, SECRET_KEY);
		return payload;
	} catch (error) {
		return null;
	}
}
