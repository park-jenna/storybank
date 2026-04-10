// /questions 아래에 붙일 라우트들 (공통 질문 = 백엔드 상수)

const express = require("express");
const prisma = require("../prisma");
const { requireAuth } = require("../middleware/auth");
const { COMMON_QUESTIONS, getCommonQuestionById } = require("../constants/commonQuestions");
const { sendError, sendInternalError } = require("../utils/http");

const router = express.Router();

/*
 * GET /questions/common
 * 공통 질문 목록 (백엔드 상수). 로그인 필수. 각 질문에 alreadySaved 포함.
 */
router.get("/common", requireAuth, async (req, res) => {
    try {
        const userId = req.user.userId;
        const saved = await prisma.question.findMany({
            where: { userId },
            select: { content: true },
        });
        const savedContents = new Set(saved.map((q) => q.content));
        const questions = COMMON_QUESTIONS.map((q) => ({
            ...q,
            alreadySaved: savedContents.has(q.content),
        }));
        return res.json({ questions });
    } catch (error) {
        return sendInternalError(res, error, "Error fetching common questions:");
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
            return sendError(res, 404, {
                code: "QUESTION_NOT_FOUND",
                message: "Question not found",
            });
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
        return sendInternalError(res, error, "Error fetching recommendations:");
    }
});

module.exports = router;
