const express = require("express");
const rateLimit = require("express-rate-limit");
const bcrypt = require("bcrypt");
const { Prisma } = require("@prisma/client");
const prisma = require("../prisma"); 
const { signToken } = require("../utils/jwt"); // JWT 발급 함수
const { authBodySchema } = require("../schemas/auth"); // Zod 스키마
const { sendError, sendInternalError, sendValidationError } = require("../utils/http");

const router = express.Router();

const authLimiter =
  process.env.NODE_ENV === "test"
    ? (req, res, next) => next()
    : rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 30,
        standardHeaders: true,
        legacyHeaders: false,
        message: { error: "Too many attempts, try again later.", code: "RATE_LIMITED" },
      });

/*
* POST /auth/signup
* Body: { email, password }
*/
router.post("/signup", authLimiter, async (req, res) => {
    try {
        const result = authBodySchema.safeParse(req.body);
        if (!result.success) {
            return sendValidationError(res, result.error.issues);
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
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            return sendError(res, 409, {
                code: "EMAIL_ALREADY_REGISTERED",
                message: "Email already registered",
            });
        }
        return sendInternalError(res, error, "Error during signup:");
    }
});

/*
* POST /auth/login
* body: { email, password }
*/
router.post("/login/", authLimiter, async (req, res) => {
    try {

        // 스키마로 요청 바디 검증
        const result = authBodySchema.safeParse(req.body);
        if (!result.success) {
            return sendValidationError(res, result.error.issues);
        }

        const { email, password } = result.data;

        // 1) 이메일로 유저 찾기
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return sendError(res, 401, {
                code: "INVALID_CREDENTIALS",
                message: "Invalid email or password",
            });
        }

        // 2) 비밀번호 비교 (평문 vs 해시)
        const ok = await bcrypt.compare(password, user.password);
        if (!ok) {
            return sendError(res, 401, {
                code: "INVALID_CREDENTIALS",
                message: "Invalid credentials",
            });
        }

        // 3) JWT 발급
        const token = signToken({ userId: user.id, email: user.email });

        return res.json({ user: { id: user.id, email: user.email }, token });
    } catch (error) {
        return sendInternalError(res, error, "Error during login:");
    }
});

module.exports = router;
