// /user-questions — 내 질문 보관함 (Saved Questions). Question = user's saved, QuestionStory = link to stories.

const express = require("express");
const prisma = require("../prisma");
const { requireAuth } = require("../middleware/auth");
const { getCommonQuestionById } = require("../constants/commonQuestions");

const router = express.Router();

/*
 * GET /user-questions
 * 로그인한 유저가 보관한 질문 + 연결된 스토리들 조회
 */
router.get("/", requireAuth, async (req, res) => {
    try {
        const userId = req.user.userId;

        const questions = await prisma.question.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            include: {
                stories: {
                    include: {
                        story: true,
                    },
                },
            },
        });

        const result = questions.map((q) => ({
            id: q.id,
            createdAt: q.createdAt,
            question: {
                id: q.id,
                content: q.content,
                recommendedCategories: q.recommendedCategories ?? [],
            },
            stories: q.stories.map((qs) => qs.story),
        }));

        return res.json({ userQuestions: result });
    } catch (error) {
        console.error("Error fetching user questions:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

/*
 * POST /user-questions
 * Body: { commonQuestionId: string, storyIds?: string[] }
 * 이미 저장된 질문이면 스토리 연결만 갱신, 없으면 새로 생성.
 */
router.post("/", requireAuth, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { commonQuestionId, storyIds } = req.body;

        const common = getCommonQuestionById(commonQuestionId);
        if (!common) {
            return res.status(400).json({ error: "Invalid commonQuestionId" });
        }

        const existing = await prisma.question.findFirst({
            where: { userId, content: common.content },
        });

        let question;
        if (existing) {
            question = existing;
            await prisma.questionStory.deleteMany({ where: { questionId: existing.id } });
        } else {
            question = await prisma.question.create({
                data: {
                    userId,
                    content: common.content,
                    recommendedCategories: common.recommendedCategories ?? [],
                },
            });
        }

        if (Array.isArray(storyIds) && storyIds.length > 0) {
            await prisma.questionStory.createMany({
                data: storyIds.map((storyId) => ({
                    questionId: question.id,
                    storyId,
                })),
            });
        }

        return res.status(existing ? 200 : 201).json({
            userQuestion: question,
            alreadySaved: !!existing,
        });
    } catch (error) {
        console.error("Error creating user question:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

/*
 * DELETE /user-questions/:id
 * 저장한 질문 삭제 (본인 것만). 연결된 QuestionStory 먼저 삭제 후 Question 삭제.
 */
router.delete("/:id", requireAuth, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;

        const question = await prisma.question.findFirst({
            where: { id, userId },
            select: { id: true },
        });

        if (!question) {
            return res.status(404).json({ error: "Question not found" });
        }

        await prisma.questionStory.deleteMany({ where: { questionId: id } });
        await prisma.question.delete({
            where: { id },
        });

        return res.json({ ok: true });
    } catch (error) {
        console.error("Error deleting user question:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
