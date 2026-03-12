const { z } = require("zod");

const ALLOWED_CATEGORIES = [
    "Leadership",
    "Teamwork / Collaboration",
    "Communication",
    "Conflict Resolution",
    "Problem Solving",
    "Adaptability",
    "Growth / Learning",
];

const createStoryBodySchema = z.object({
    title: z.string().min(1, "Title is required"),
    categories: z
        .array(z.enum(ALLOWED_CATEGORIES))
        .min(1, "At least one category is required"),
    situation: z.string().optional(),
    action: z.string().optional(),
    result: z.string().optional(),
});

const updateStoryBodySchema = z.object({
    title: z.string().min(1).optional(),
    categories: z.array(z.enum(ALLOWED_CATEGORIES)).min(1).optional(),
    situation: z.string().optional(),
    action: z.string().optional(),
    result: z.string().optional(),
});

module.exports = { createStoryBodySchema, updateStoryBodySchema };