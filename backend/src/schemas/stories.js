const { z } = require("zod");

const createStoryBodySchema = z.object({
    title: z.string().min(1, "Title is required"),
    categories: z.array(z.string().min(1)).min(1, "At least one category is required"),
    situation: z.string().optional(),
    action: z.string().optional(),
    result: z.string().optional(),
});

module.exports = { createStoryBodySchema };