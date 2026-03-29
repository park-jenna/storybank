/**
 * Common interview questions. Used by GET /questions/common and for recommendations.
 * Single source of truth for search/filter later.
 */

const COMMON_QUESTIONS = [
  { id: "q1", content: "Tell me about a time you had a conflict with a teammate. How did you resolve it?", recommendedCategories: ["Conflict Resolution", "Communication"] },
  { id: "q2", content: "Describe a situation where you had to work with someone difficult.", recommendedCategories: ["Conflict Resolution", "Communication"] },
  { id: "q3", content: "Tell me about a time you took the lead on a project or initiative.", recommendedCategories: ["Leadership", "Teamwork / Collaboration"] },
  { id: "q4", content: "Describe a time you had to influence others without formal authority.", recommendedCategories: ["Leadership", "Communication"] },
  { id: "q5", content: "Tell me about a time you worked effectively as part of a team.", recommendedCategories: ["Teamwork / Collaboration"] },
  { id: "q6", content: "Describe a situation where you had to collaborate across teams or functions.", recommendedCategories: ["Teamwork / Collaboration", "Communication"] },
  { id: "q7", content: "Tell me about a time you had to explain a technical or complex idea to a non-technical audience.", recommendedCategories: ["Communication"] },
  { id: "q8", content: "Describe a situation where miscommunication caused a problem. How did you fix it?", recommendedCategories: ["Communication", "Problem Solving"] },
  { id: "q9", content: "Tell me about a challenging problem you solved. What was your approach?", recommendedCategories: ["Problem Solving"] },
  { id: "q10", content: "Describe a time when you had to make a decision with incomplete information.", recommendedCategories: ["Problem Solving", "Adaptability"] },
  { id: "q11", content: "Tell me about a time your plans changed at the last minute. How did you adapt?", recommendedCategories: ["Adaptability"] },
  { id: "q12", content: "Describe a situation where you had to learn something new quickly.", recommendedCategories: ["Adaptability", "Growth / Learning"] },
  { id: "q13", content: "Tell me about a time you failed or made a mistake. What did you learn?", recommendedCategories: ["Growth / Learning"] },
  { id: "q14", content: "Describe a situation where you received critical feedback. How did you respond?", recommendedCategories: ["Growth / Learning", "Communication"] },
  { id: "q15", content: "Tell me about a time you had to push through obstacles or setbacks.", recommendedCategories: ["Problem Solving", "Adaptability"] },
  { id: "q16", content: "Tell me about a time you had to prioritize when everything felt urgent.", recommendedCategories: ["Problem Solving", "Adaptability"] },
  { id: "q17", content: "Describe a time you delivered strong results under a tight deadline.", recommendedCategories: ["Problem Solving", "Adaptability"] },
  { id: "q18", content: "Tell me about a time you disagreed with your manager or a stakeholder. How did you handle it?", recommendedCategories: ["Communication", "Conflict Resolution"] },
  { id: "q19", content: "Describe a situation where you improved a process or workflow.", recommendedCategories: ["Problem Solving", "Leadership"] },
  { id: "q20", content: "Tell me about a time you went above and beyond for a customer, user, or stakeholder.", recommendedCategories: ["Communication", "Teamwork / Collaboration"] },
  { id: "q21", content: "Describe a time you had to motivate or rally a team toward a goal.", recommendedCategories: ["Leadership", "Teamwork / Collaboration"] },
  { id: "q22", content: "Tell me about your biggest professional accomplishment. What made it meaningful?", recommendedCategories: ["Leadership", "Problem Solving"] },
  { id: "q23", content: "Describe a time you had to work with incomplete requirements or unclear goals.", recommendedCategories: ["Adaptability", "Problem Solving"] },
  { id: "q24", content: "Tell me about a time you mentored someone or helped a colleague grow.", recommendedCategories: ["Leadership", "Growth / Learning"] },
  { id: "q25", content: "Describe a situation where you had to say no or push back on a request.", recommendedCategories: ["Communication", "Leadership"] },
  { id: "q26", content: "Tell me about a time you juggled multiple priorities or projects at once.", recommendedCategories: ["Adaptability", "Problem Solving"] },
  { id: "q27", content: "Describe a project or initiative you are most proud of. What was your role?", recommendedCategories: ["Teamwork / Collaboration", "Leadership"] },
  { id: "q28", content: "Tell me about a time you spotted a risk early and acted before it became a bigger problem.", recommendedCategories: ["Problem Solving", "Leadership"] },
  { id: "q29", content: "Describe a time you had to build trust with someone who was skeptical of you or your team.", recommendedCategories: ["Communication", "Teamwork / Collaboration"] },
  { id: "q30", content: "Tell me about a time you had to stand up for what was right or navigate a gray-area decision.", recommendedCategories: ["Leadership", "Communication"] },
];

function getCommonQuestionById(id) {
  return COMMON_QUESTIONS.find((q) => q.id === id) ?? null;
}

module.exports = {
  COMMON_QUESTIONS,
  getCommonQuestionById,
};
