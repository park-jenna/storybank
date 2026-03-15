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

const updateUserQuestionBodySchema = z.object({
  content: z.string().min(1).optional(),
  recommendedCategories: z.array(z.enum(ALLOWED_CATEGORIES)).optional(),
  storyIds: z.array(z.string().uuid()).optional(),
});

module.exports = { updateUserQuestionBodySchema };
