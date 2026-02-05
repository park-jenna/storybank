const { z } = require("zod");

const authBodySchema = z.object({
    email: z.string().email(), // 이메일 형식 검사
    password: z.string().min(6, "Password must be at least 6 characters long"),
});

module.exports = { authBodySchema };