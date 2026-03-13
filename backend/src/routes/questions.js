// /questions 아래에 붙일 라우트들을 이 파일에서 정의

const express = require("express");
const prisma = require("../prisma");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

/*
 * GET /questions/common
 * 공통 질문만 조회 (isCommon === true). 로그인 없이 호출 가능.
 */
router.get("/common", async (req, res) => {
    try {
        const questions = await prisma.question.findMany({
            where: { isCommon: true },
            orderBy: { createdAt: "desc" },
        });
        return res.json({ questions });
    } catch (error) {
        console.error("Error fetching common questions:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

/*
* GET / questions/:id/recommendations
* :id = question id
* authenticated user only
*/
router.get("/:id/recommendations", requireAuth, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;

        // 1) 질문 먼저 찾기
        const question = await prisma.question.findUnique({
            where: { id },
        });

        if (!question) {
            return res.status(404).json({ error: "Question not found" });
        }

        // 2) 이 질문의 recommendedCategories 에 해당하는 스토리들 가져오기
        const recommendedStories = await prisma.story.findMany({
            where: {
                userId, // 이 유저의 스토리만
                // categories 가 question.recommendedCategories 에 해당하는 스토리들
                categories: question.recommendedCategories.length 
                ? { hasSome: question.recommendedCategories }
                : undefined,  // 비어있는 경우 건너뛰기
            },
            orderBy: { createdAt: "desc" },
        });

        return res.json({ question, recommendedStories });
    } catch (error) {
        console.error("Error fetching recommendations:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;