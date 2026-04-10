const express = require("express");
const prisma = require("../prisma");
const { requireAuth } = require("../middleware/auth");
const { createStoryBodySchema, updateStoryBodySchema } = require("../schemas/stories");
const { sendError, sendInternalError, sendValidationError } = require("../utils/http");

const router = express.Router();

/*
* POST /stories
* Body: { userId, title, categories, situation, action, result }
*/
router.post("/", requireAuth, async (req, res) => {
    try {
        // 인증된 유저의 userId 가져오기
        const userId = req.user.userId;

        // 요청 바디 검증
        const parsed = createStoryBodySchema.safeParse(req.body);
        if (!parsed.success) {
            return sendValidationError(res, parsed.error.issues);
        }
        const { title, categories, situation, action, result } = parsed.data;
        
        const story = await prisma.story.create({
            data: {
                userId,
                title,
                categories,
                situation: situation ?? "",
                action: action ?? "",
                result: result ?? "",
            },
        });

        return res.status(201).json( {story} );
    } catch (error) {
        return sendInternalError(res, error, "Error creating story:");
    }
}); 

/*
* GET /stories
*/
router.get("/", requireAuth, async (req, res) => {
    try {
        const userId = req.user.userId;

        const stories = await prisma.story.findMany({
            where: { userId: String(userId) },
            orderBy: { createdAt: 'desc' },
        });

        return res.json({ stories });
    } catch (error) {
        return sendInternalError(res, error, "Error fetching stories:");
    }
});

// GET /stories/:id
// 특정 스토리 가져오기
router.get("/:id", requireAuth, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;

        // userId 와 id 로 스토리 찾기
        const story = await prisma.story.findFirst({
            where: { 
                id,
                userId,
             },
        });

        if (!story) {
            return sendError(res, 404, {
                code: "STORY_NOT_FOUND",
                message: "Story not found",
            });
        }

        return res.json({ story });
    } catch (error) {
        return sendInternalError(res, error, "Error fetching story:");
    }
});

/*
* DELETE /stories/:id
* 특정 스토리 삭제 (본인 것만)
*/
router.delete("/:id", requireAuth, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;
        
        // 1) 스토리 존재 확인
        // 본인 것인지도 같이 확인 -> findFirst
        const story = await prisma.story.findFirst({
            where: { id, userId },
            select: { id: true },
        });

        if (!story) {
            return sendError(res, 404, {
                code: "STORY_NOT_FOUND",
                message: "Story not found",
            });
        }

        // 2) 이 스토리와 연결된 질문 링크 먼저 삭제 (FK 제약 때문에 순서 중요)
        await prisma.questionStory.deleteMany({
            where: { storyId: id },
        });

        // 3) 스토리 삭제
        await prisma.story.delete({
            where: { id },
        });

        // 4) 응답
        return res.json({ ok: true });
    } catch (error) {
        return sendInternalError(res, error, "Error deleting story:");
    }
});

/* PATCH /stories/:id
* 특정 스토리 수정 (본인 것만)
* body: { title, categories, situation, action, result }
*/
router.patch("/:id", requireAuth, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;

        // 1) 요청 바디 검증
        // 존재하는 스토리인지 확인 + 본인 것인지 확인 -> findFirst
        const existing = await prisma.story.findFirst({
            where: { id, userId },
        });

        if (!existing) {
            return sendError(res, 404, {
                code: "STORY_NOT_FOUND",
                message: "Story not found",
            });
        }

        // 2) 업데이트할 데이터 검증 및 준비 (partial update)
        const parsed = updateStoryBodySchema.safeParse(req.body);
        if (!parsed.success) {
            return sendValidationError(res, parsed.error.issues);
        }

        const body = parsed.data;
        const updatedData = {};
        if (body.title !== undefined) updatedData.title = body.title;
        if (body.categories !== undefined) updatedData.categories = body.categories;
        if (body.situation !== undefined) updatedData.situation = body.situation;
        if (body.action !== undefined) updatedData.action = body.action;
        if (body.result !== undefined) updatedData.result = body.result;

        if (Object.keys(updatedData).length === 0) {
            return sendError(res, 400, {
                code: "NO_FIELDS_TO_UPDATE",
                message: "No valid fields to update",
            });
        }

        // 3) 스토리 업데이트
        const updatedStory = await prisma.story.update({
            where: { id },
            data: updatedData,
        });

        return res.json({ story: updatedStory });
    } catch (error) {
        return sendInternalError(res, error, "Error updating story:");
    }
});

module.exports = router;
