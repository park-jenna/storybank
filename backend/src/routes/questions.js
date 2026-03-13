// /questions 아래에 붙일 라우트들을 이 파일에서 정의

const express = require("express");
const prisma = require("../prisma");

const router = express.Router();

/*
 * GET /questions/common
 * 공통 질문만 조회 (isCommon === true). 로그인 없이 호출 가능.
 */
router.get("/common", async (req, res) => {
    try {
        const questions = await prisma.question.findMany({
            where: { isCommon: true },
            orderBy: { createdAt: "asc" },
        });
        return res.json({ questions });
    } catch (error) {
        console.error("Error fetching common questions:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;