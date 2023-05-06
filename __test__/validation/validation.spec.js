const { signupSchema, loginSchema, postSchema, commentSchema } = require("../../controllers/joi");

test("테스트가 성공하는 상황", () => {
	expect(signupSchema("이메일이 아니에요")).toEqual(false);
});

test("테스트가 실패하는 상황", () => {
	expect(isEmail("my-email@domain.com")).toEqual(true);
});
