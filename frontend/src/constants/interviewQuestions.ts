/**
 * Common behavioral interview questions mapped to competencies (categories).
 * Each question can have multiple recommended categories; stories tagged with
 * any of them can be used to answer the question.
 */

export type InterviewQuestion = {
  id: string;
  text: string;
  /** Recommended categories; stories with any of these can answer this question. */
  categories: string[];
};

export const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  { id: "q1", text: "Tell me about a time you had a conflict with a teammate. How did you resolve it?", categories: ["Conflict Resolution", "Communication"] },
  { id: "q2", text: "Describe a situation where you had to work with someone difficult.", categories: ["Conflict Resolution", "Communication"] },
  { id: "q3", text: "Tell me about a time you took the lead on a project or initiative.", categories: ["Leadership", "Teamwork / Collaboration"] },
  { id: "q4", text: "Describe a time you had to influence others without formal authority.", categories: ["Leadership", "Communication"] },
  { id: "q5", text: "Tell me about a time you worked effectively as part of a team.", categories: ["Teamwork / Collaboration"] },
  { id: "q6", text: "Describe a situation where you had to collaborate across teams or functions.", categories: ["Teamwork / Collaboration", "Communication"] },
  { id: "q7", text: "Tell me about a time you had to explain a technical or complex idea to a non-technical audience.", categories: ["Communication"] },
  { id: "q8", text: "Describe a situation where miscommunication caused a problem. How did you fix it?", categories: ["Communication", "Problem Solving"] },
  { id: "q9", text: "Tell me about a challenging problem you solved. What was your approach?", categories: ["Problem Solving"] },
  { id: "q10", text: "Describe a time when you had to make a decision with incomplete information.", categories: ["Problem Solving", "Adaptability"] },
  { id: "q11", text: "Tell me about a time your plans changed at the last minute. How did you adapt?", categories: ["Adaptability"] },
  { id: "q12", text: "Describe a situation where you had to learn something new quickly.", categories: ["Adaptability", "Growth / Learning"] },
  { id: "q13", text: "Tell me about a time you failed or made a mistake. What did you learn?", categories: ["Growth / Learning"] },
  { id: "q14", text: "Describe a situation where you received critical feedback. How did you respond?", categories: ["Growth / Learning", "Communication"] },
  { id: "q15", text: "Tell me about a time you had to push through obstacles or setbacks.", categories: ["Problem Solving", "Adaptability"] },
];

/**
 * Get all questions that match any of the given categories.
 * A question matches if it has at least one recommended category in common with the story.
 */
export function getQuestionsForCategories(categories: string[]): InterviewQuestion[] {
  const set = new Set(categories);
  return INTERVIEW_QUESTIONS.filter((q) => q.categories.some((c) => set.has(c)));
}

/**
 * Get recommended categories for a question (for filtering stories).
 */
export function getCategoriesForQuestion(questionId: string): string[] {
  const q = INTERVIEW_QUESTIONS.find((q) => q.id === questionId);
  return q?.categories ?? [];
}

/**
 * Get question by id.
 */
export function getQuestionById(questionId: string): InterviewQuestion | null {
  return INTERVIEW_QUESTIONS.find((q) => q.id === questionId) ?? null;
}
