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
  { id: "q16", text: "Tell me about a time you had to prioritize when everything felt urgent.", categories: ["Problem Solving", "Adaptability"] },
  { id: "q17", text: "Describe a time you delivered strong results under a tight deadline.", categories: ["Problem Solving", "Adaptability"] },
  { id: "q18", text: "Tell me about a time you disagreed with your manager or a stakeholder. How did you handle it?", categories: ["Communication", "Conflict Resolution"] },
  { id: "q19", text: "Describe a situation where you improved a process or workflow.", categories: ["Problem Solving", "Leadership"] },
  { id: "q20", text: "Tell me about a time you went above and beyond for a customer, user, or stakeholder.", categories: ["Communication", "Teamwork / Collaboration"] },
  { id: "q21", text: "Describe a time you had to motivate or rally a team toward a goal.", categories: ["Leadership", "Teamwork / Collaboration"] },
  { id: "q22", text: "Tell me about your biggest professional accomplishment. What made it meaningful?", categories: ["Leadership", "Problem Solving"] },
  { id: "q23", text: "Describe a time you had to work with incomplete requirements or unclear goals.", categories: ["Adaptability", "Problem Solving"] },
  { id: "q24", text: "Tell me about a time you mentored someone or helped a colleague grow.", categories: ["Leadership", "Growth / Learning"] },
  { id: "q25", text: "Describe a situation where you had to say no or push back on a request.", categories: ["Communication", "Leadership"] },
  { id: "q26", text: "Tell me about a time you juggled multiple priorities or projects at once.", categories: ["Adaptability", "Problem Solving"] },
  { id: "q27", text: "Describe a project or initiative you are most proud of. What was your role?", categories: ["Teamwork / Collaboration", "Leadership"] },
  { id: "q28", text: "Tell me about a time you spotted a risk early and acted before it became a bigger problem.", categories: ["Problem Solving", "Leadership"] },
  { id: "q29", text: "Describe a time you had to build trust with someone who was skeptical of you or your team.", categories: ["Communication", "Teamwork / Collaboration"] },
  { id: "q30", text: "Tell me about a time you had to stand up for what was right or navigate a gray-area decision.", categories: ["Leadership", "Communication"] },
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

/** Common question id by content (for deep link to Common Questions). */
export function getCommonQuestionIdByContent(content: string): string | null {
  const q = INTERVIEW_QUESTIONS.find((q) => q.text === content);
  return q?.id ?? null;
}
