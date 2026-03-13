// /user-questions — 내 질문 보관함 (Saved Questions)

const express = require("express");
const prisma = require("../prisma");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

/*
 * GET /user-questions
 * 로그인한 유저가 보관한 질문 + 연결된 스토리들 조회
 */
router.get("/", requireAuth, async (req, res) => {
    try {
        const userId = req.user.userId;

        const userQuestions = await prisma.userQuestion.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            include: {
                question: true,
                userQuestionStories: {
                    include: {
                        story: true,
                    },
                },
            },
        });

        const result = userQuestions.map((uq) => ({
            id: uq.id,
            createdAt: uq.createdAt,
            question: uq.question,
            stories: uq.userQuestionStories.map((uqStory) => uqStory.story),
        }));

        return res.json({ userQuestions: result });
    } catch (error) {
        console.error("Error fetching user questions:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

/*
 * POST /user-questions
 * Body: { questionId, storyIds: string[] }
 * 질문 보관함에 저장 + 연결할 스토리 선택
 */
router.post("/", requireAuth, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { questionId, storyIds } = req.body;

        const userQuestion = await prisma.userQuestion.create({
            data: { userId, questionId },
        });

        if (Array.isArray(storyIds) && storyIds.length > 0) {
            await prisma.userQuestionStory.createMany({
                data: storyIds.map((storyId) => ({
                    userQuestionId: userQuestion.id,
                    storyId,
                })),
            });
        }

        return res.status(201).json({ userQuestion });
    } catch (error) {
        console.error("Error creating user question:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
