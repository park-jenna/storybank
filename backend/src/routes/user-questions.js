// /user-questions — 내 질문 보관함 (Saved Questions). Question = user's saved, QuestionStory = link to stories.

const express = require("express");
const prisma = require("../prisma");
const { requireAuth } = require("../middleware/auth");
const { getCommonQuestionById } = require("../constants/commonQuestions");
const { updateUserQuestionBodySchema } = require("../schemas/user-questions");

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
 * GET /user-questions/:id
 * 저장한 질문 단건 조회 (본인 것만). 연결된 스토리 포함.
 */
router.get("/:id", requireAuth, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;

        const question = await prisma.question.findFirst({
            where: { id, userId },
            include: {
                stories: {
                    include: { story: true },
                },
            },
        });

        if (!question) {
            return res.status(404).json({ error: "Question not found" });
        }

        const result = {
            id: question.id,
            createdAt: question.createdAt,
            question: {
                id: question.id,
                content: question.content,
                recommendedCategories: question.recommendedCategories ?? [],
            },
            stories: question.stories.map((qs) => qs.story),
        };

        return res.json({ userQuestion: result });
    } catch (error) {
        console.error("Error fetching user question:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

/*
 * PATCH /user-questions/:id
 * 저장한 질문 수정 (본인 것만). content, recommendedCategories, storyIds(연결 스토리) 부분 수정 가능.
 * body: { content?, recommendedCategories?, storyIds? }
 */
router.patch("/:id", requireAuth, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;

        const existing = await prisma.question.findFirst({
            where: { id, userId },
        });

        if (!existing) {
            return res.status(404).json({ error: "Question not found" });
        }

        const parsed = updateUserQuestionBodySchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                error: "Invalid request body",
                details: parsed.error.issues,
            });
        }

        const body = parsed.data;
        const updatedData = {};
        if (body.content !== undefined) updatedData.content = body.content;
        if (body.recommendedCategories !== undefined)
            updatedData.recommendedCategories = body.recommendedCategories;

        const hasStoryIdsUpdate = body.storyIds !== undefined;
        if (Object.keys(updatedData).length === 0 && !hasStoryIdsUpdate) {
            return res.status(400).json({ error: "No valid fields to update" });
        }

        if (Object.keys(updatedData).length > 0) {
            await prisma.question.update({
                where: { id },
                data: updatedData,
            });
        }

        if (body.storyIds !== undefined) {
            await prisma.questionStory.deleteMany({ where: { questionId: id } });
            if (body.storyIds.length > 0) {
                const userStoryIds = await prisma.story.findMany({
                    where: { userId },
                    select: { id: true },
                });
                const validIds = new Set(userStoryIds.map((s) => s.id));
                const toLink = body.storyIds.filter((sid) => validIds.has(sid));
                await prisma.questionStory.createMany({
                    data: toLink.map((storyId) => ({
                        questionId: id,
                        storyId,
                    })),
                });
            }
        }

        const updated = await prisma.question.findFirst({
            where: { id, userId },
            include: {
                stories: {
                    include: { story: true },
                },
            },
        });

        const result = {
            id: updated.id,
            createdAt: updated.createdAt,
            question: {
                id: updated.id,
                content: updated.content,
                recommendedCategories: updated.recommendedCategories ?? [],
            },
            stories: updated.stories.map((qs) => qs.story),
        };

        return res.json({ userQuestion: result });
    } catch (error) {
        console.error("Error updating user question:", error);
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
