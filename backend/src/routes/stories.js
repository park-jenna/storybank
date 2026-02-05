const express = require("express");
const prisma = require("../prisma");
const { requireAuth } = require("../middleware/auth");
const { createStoryBodySchema } = require("../schemas/stories");

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
            return res.status(400).json({
                error: "Invalid request body",
                details: parsed.error.issues,
            });
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
        console.error("Error creating story:", error);
        return res.status(500).json({ error: "Internal server error" });
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
        console.error("Error fetching stories:", error);
        return res.status(500).json({ error: "Internal server error" });
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
            return res.status(404).json({ error: "Story not found" });
        }

        return res.json({ story });
    } catch (error) {
        console.error("Error fetching story:", error);
        return res.status(500).json({ error: "Internal server error" });
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
            return res.status(404).json({ error: "Story not found" });
        }

        // 2) 스토리 삭제
        await prisma.story.delete({
            where: { id },
        });

        // 3) 응답
        return res.json({ ok: true });
    } catch (error) {
        console.error("Error deleting story:", error);
        return res.status(500).json({ error: "Internal server error" });
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
            return res.status(404).json({ error: "Story not found" });
        }

        // 2) 업데이트할 데이터 준비 (partial update)
        const { title, categories, situation, action, result } = req.body;

        const updatedData = {};
        if (typeof title === "string" && title.length > 0) {
            updatedData.title = title;
        }
        if (Array.isArray(categories) && categories.length > 0) {
            updatedData.categories = categories;
        }
        if (typeof situation === "string") {
            updatedData.situation = situation;
        }
        if (typeof action === "string") {
            updatedData.action = action;
        }
        if (typeof result === "string") {
            updatedData.result = result;
        }

        // 아무것도 업데이트할 게 없으면 에러
        if (Object.keys(updatedData).length === 0) {
            return res.status(400).json({ error: "No valid fields to update" });
        }

        // 3) 스토리 업데이트
        const updatedStory = await prisma.story.update({
            where: { id },
            data: updatedData,
        });

        return res.json({ story: updatedStory });
    } catch (error) {
        console.error("Error updating story:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;