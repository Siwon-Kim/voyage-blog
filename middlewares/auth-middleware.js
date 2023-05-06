const { TokenHelper } = require("../utils/tokenHelper");
const { UserRepository, RedisClientRepository } = require("../repositories/users.repository");

module.exports = async (req, res, next) => {
	const accessToken = req.cookies.accessToken;
	const refreshToken = req.cookies.refreshToken;
	let newAccessToken = null;

	const [authAccessType, authAccessToken] = (accessToken ?? "").split(" ");
	const [authRefreshType, authRefreshToken] = (refreshToken ?? "").split(" ");

	if (authAccessType !== "Bearer" || !authAccessToken) {
		console.error("Refresh Token이 존재하지 않습니다.");
		res.clearCookie("accessToken");
		return res.status(403).json({
			errorMessage: "로그인이 필요한 기능입니다.",
		});
	}

	if (authRefreshType !== "Bearer" || !authRefreshToken) {
		console.error("Access Token이 존재하지 않습니다.");
		res.clearCookie("refreshToken");
		return res.status(403).json({
			errorMessage: "로그인이 필요한 기능입니다.",
		});
	}

	const tokenHelper = new TokenHelper();
	const isAccessTokenValid = tokenHelper.validateAccessToken(authAccessToken);
	const isRefreshTokenValid = tokenHelper.validateRefreshToken(authRefreshToken);

	try {
		const userRepository = new UserRepository();
		const redisClient = new RedisClientRepository();

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

			newAccessToken = tokenHelper.createAccessToken(accessTokenId);
			res.cookie("accessToken", `Bearer ${newAccessToken}`);
		}
		const { userId } = tokenHelper.getAccessTokenPayload(
			newAccessToken ?? authAccessToken
		);

		const user = await userRepository.findById(userId);
		res.locals.user = user;

		next();
	} catch (error) {
		console.error(error);
		res.clearCookie("accessToken");
		res.clearCookie("refreshToken");
		return res.status(403).json({
			// 쿠키가 비정상적이거나 만료된 경우
			errorMessage: "전달된 쿠키에서 오류가 발생하였습니다.",
		});
	}
};
