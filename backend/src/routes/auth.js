const express = require("express");
const bcrypt = require("bcrypt");
const prisma = require("../prisma"); 
const { signToken } = require("../utils/jwt"); // JWT 발급 함수
const { authBodySchema } = require("../schemas/auth"); // Zod 스키마
const { de } = require("zod/v4/locales");

const router = express.Router();

/*
* POST /auth/signup
* Body: { email, password }
*/
router.post("/signup", async (req, res) => {
    try {
        const result = authBodySchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                error: "Invalid request body",
                details: result.error.issues,
            });
        }

        const { email, password } = result.data;
        
        // 1) 비밀번호 해시
        const hashed = await bcrypt.hash(password, 10);

        // 2) DB에 유저 생성
        const user = await prisma.user.create({
            data: { email, password: hashed},
            select: { id: true, email: true },
        });

        // 3) JWT 발급 (payload에 userId 넣기)
        const token = signToken({ userId: user.id, email: user.email });

        return res.status(201).json({ user, token });
    } catch (error) {
        console.error("Error during signup:", error);
        // 이메일 중복이면 prisma가 에러 던짐
        return res.status(500).json({ error: "Internal server error" });
    }
});

/*
* POST /auth/login
* body: { email, password }
*/
router.post("/login/", async (req, res) => {
    try {

        // 스키마로 요청 바디 검증
        const result = authBodySchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                error: "Invalid request body",
                details: result.error.issues,
            });
        }

        const { email, password } = result.data;

        // 1) 이메일로 유저 찾기
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // 2) 비밀번호 비교 (평문 vs 해시)
        const ok = await bcrypt.compare(password, user.password);
        if (!ok) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // 3) JWT 발급
        const token = signToken({ userId: user.id, email: user.email });

        return res.json({ user: { id: user.id, email: user.email }, token });
    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;