// /questions 아래에 붙일 라우트들 (공통 질문 = 백엔드 상수)

const express = require("express");
const prisma = require("../prisma");
const { requireAuth } = require("../middleware/auth");
const { COMMON_QUESTIONS, getCommonQuestionById } = require("../constants/commonQuestions");

const router = express.Router();

/*
 * GET /questions/common
 * 공통 질문 목록 (백엔드 상수). 로그인 없이 호출 가능.
 */
router.get("/common", async (req, res) => {
    try {
        return res.json({ questions: COMMON_QUESTIONS });
    } catch (error) {
        console.error("Error fetching common questions:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

/*
 * GET /questions/:id/recommendations
 * :id = common question id (상수 id). 해당 질문의 recommendedCategories로 유저 스토리 추천.
 */
router.get("/:id/recommendations", requireAuth, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;

        const question = getCommonQuestionById(id);
        if (!question) {
            return res.status(404).json({ error: "Question not found" });
        }

        const recommendedCategories = question.recommendedCategories ?? [];
        const recommendedStories = await prisma.story.findMany({
            where: {
                userId,
                categories: recommendedCategories.length
                    ? { hasSome: recommendedCategories }
                    : undefined,
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