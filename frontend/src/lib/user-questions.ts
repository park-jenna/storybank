import { apiGet, apiPost } from "./api";

export type Question = {
  id: string;
  content: string;
  isCommon: boolean;
  recommendedCategories: string[];
  createdAt: string;
};

export type Story = {
  id: string;
  userId: string;
  title: string;
  categories: string[];
  situation: string;
  action: string;
  result: string;
  createdAt: string;
};

export type UserQuestionItem = {
  id: string;
  createdAt: string;
  question: Question;
  stories: Story[];
};

export type UserQuestionsResponse = {
  userQuestions: UserQuestionItem[];
};

// 내 질문 보관함 조회
export async function fetchUserQuestions(token: string) {
  return apiGet<UserQuestionsResponse>("/user-questions", token);
}

// 공통 질문 목록 (no auth required)
export type CommonQuestionsResponse = { questions: Question[] };
export async function fetchCommonQuestions() {
  return apiGet<CommonQuestionsResponse>("/questions/common");
}

// 질문별 추천 스토리 (auth required)
export type RecommendationsResponse = { question: Question; recommendedStories: Story[] };
export async function fetchQuestionRecommendations(token: string, questionId: string) {
  return apiGet<RecommendationsResponse>(`/questions/${questionId}/recommendations`, token);
}

// 질문 보관함에 저장 (commonQuestionId = 상수 id, storyIds = 연결할 스토리)
export type CreateUserQuestionInput = { commonQuestionId: string; storyIds?: string[] };
export type CreateUserQuestionResponse = { userQuestion: { id: string; userId: string; content: string; recommendedCategories: string[]; createdAt: string } };
export async function createUserQuestion(token: string, input: CreateUserQuestionInput) {
  return apiPost<CreateUserQuestionResponse>("/user-questions", input, { token });
}
