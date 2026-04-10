// /user-questions — 내 질문 보관함 (Saved Questions). Question = user's saved, QuestionStory = link to stories.

const express = require("express");
const prisma = require("../prisma");
const { requireAuth } = require("../middleware/auth");
const { getCommonQuestionById } = require("../constants/commonQuestions");
const { updateUserQuestionBodySchema } = require("../schemas/user-questions");
const { sendError, sendInternalError, sendValidationError } = require("../utils/http");

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
        return sendInternalError(res, error, "Error fetching user questions:");
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
            return sendError(res, 400, {
                code: "INVALID_COMMON_QUESTION_ID",
                message: "Invalid commonQuestionId",
            });
        }

        const { question, alreadySaved } = await prisma.$transaction(async (tx) => {
            const existing = await tx.question.findFirst({
                where: { userId, content: common.content },
            });

            let currentQuestion = existing;
            if (existing) {
                await tx.questionStory.deleteMany({ where: { questionId: existing.id } });
            } else {
                currentQuestion = await tx.question.create({
                    data: {
                        userId,
                        content: common.content,
                        recommendedCategories: common.recommendedCategories ?? [],
                    },
                });
            }

            if (Array.isArray(storyIds) && storyIds.length > 0) {
                const userStoryIds = await tx.story.findMany({
                    where: {
                        userId,
                        id: { in: storyIds },
                    },
                    select: { id: true },
                });
                const validStoryIds = userStoryIds.map((story) => story.id);

                if (validStoryIds.length > 0) {
                    await tx.questionStory.createMany({
                        data: validStoryIds.map((storyId) => ({
                            questionId: currentQuestion.id,
                            storyId,
                        })),
                    });
                }
            }

            return {
                question: currentQuestion,
                alreadySaved: !!existing,
            };
        });

        return res.status(alreadySaved ? 200 : 201).json({
            userQuestion: question,
            alreadySaved,
        });
    } catch (error) {
        return sendInternalError(res, error, "Error creating user question:");
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
            return sendError(res, 404, {
                code: "QUESTION_NOT_FOUND",
                message: "Question not found",
            });
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
        return sendInternalError(res, error, "Error fetching user question:");
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
            return sendError(res, 404, {
                code: "QUESTION_NOT_FOUND",
                message: "Question not found",
            });
        }

        const parsed = updateUserQuestionBodySchema.safeParse(req.body);
        if (!parsed.success) {
            return sendValidationError(res, parsed.error.issues);
        }

        const body = parsed.data;
        const updatedData = {};
        if (body.content !== undefined) updatedData.content = body.content;
        if (body.recommendedCategories !== undefined)
            updatedData.recommendedCategories = body.recommendedCategories;

        const hasStoryIdsUpdate = body.storyIds !== undefined;
        if (Object.keys(updatedData).length === 0 && !hasStoryIdsUpdate) {
            return sendError(res, 400, {
                code: "NO_FIELDS_TO_UPDATE",
                message: "No valid fields to update",
            });
        }

        const updated = await prisma.$transaction(async (tx) => {
            if (Object.keys(updatedData).length > 0) {
                await tx.question.update({
                    where: { id },
                    data: updatedData,
                });
            }

            if (body.storyIds !== undefined) {
                await tx.questionStory.deleteMany({ where: { questionId: id } });
                if (body.storyIds.length > 0) {
                    const userStoryIds = await tx.story.findMany({
                        where: {
                            userId,
                            id: { in: body.storyIds },
                        },
                        select: { id: true },
                    });
                    const validStoryIds = userStoryIds.map((story) => story.id);

                    if (validStoryIds.length > 0) {
                        await tx.questionStory.createMany({
                            data: validStoryIds.map((storyId) => ({
                                questionId: id,
                                storyId,
                            })),
                        });
                    }
                }
            }

            return tx.question.findFirst({
                where: { id, userId },
                include: {
                    stories: {
                        include: { story: true },
                    },
                },
            });
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
        return sendInternalError(res, error, "Error updating user question:");
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
            return sendError(res, 404, {
                code: "QUESTION_NOT_FOUND",
                message: "Question not found",
            });
        }

        await prisma.$transaction(async (tx) => {
            await tx.questionStory.deleteMany({ where: { questionId: id } });
            await tx.question.delete({
                where: { id },
            });
        });

        return res.json({ ok: true });
    } catch (error) {
        return sendInternalError(res, error, "Error deleting user question:");
    }
});

module.exports = router;
