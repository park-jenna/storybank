import { apiGet, apiPost, apiDelete, apiPatch } from "./api";

export type Question = {
  id: string;
  content: string;
  isCommon?: boolean;
  recommendedCategories: string[];
  createdAt?: string;
  /** Present when fetched with auth; true if user has saved this question. */
  alreadySaved?: boolean;
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

// 공통 질문 목록 (로그인 필수). 각 질문에 alreadySaved 포함.
export type CommonQuestionsResponse = { questions: Question[] };
export async function fetchCommonQuestions(token: string) {
  return apiGet<CommonQuestionsResponse>("/questions/common", token);
}

// 질문별 추천 스토리 (auth required)
export type RecommendationsResponse = { question: Question; recommendedStories: Story[] };
export async function fetchQuestionRecommendations(token: string, questionId: string) {
  return apiGet<RecommendationsResponse>(`/questions/${questionId}/recommendations`, token);
}

// 질문 보관함에 저장 (commonQuestionId = 상수 id, storyIds = 연결할 스토리)
export type CreateUserQuestionInput = { commonQuestionId: string; storyIds?: string[] };
export type CreateUserQuestionResponse = {
  userQuestion: { id: string; userId: string; content: string; recommendedCategories: string[]; createdAt: string };
  alreadySaved?: boolean;
};
export async function createUserQuestion(token: string, input: CreateUserQuestionInput) {
  return apiPost<CreateUserQuestionResponse>("/user-questions", input, { token });
}

// 저장한 질문 단건 조회 (본인 것만)
export type UserQuestionDetailResponse = { userQuestion: UserQuestionItem };
export async function fetchUserQuestionById(token: string, questionId: string) {
  return apiGet<UserQuestionDetailResponse>(`/user-questions/${questionId}`, token);
}

// 저장한 질문 수정 (본인 것만). content, recommendedCategories, storyIds 부분 수정 가능.
export type UpdateUserQuestionInput = {
  content?: string;
  recommendedCategories?: string[];
  storyIds?: string[];
};
export type UpdateUserQuestionResponse = { userQuestion: UserQuestionItem };
export async function updateUserQuestion(
  token: string,
  questionId: string,
  input: UpdateUserQuestionInput
) {
  return apiPatch<UpdateUserQuestionResponse>(`/user-questions/${questionId}`, input, { token });
}

// 저장한 질문 삭제 (본인 것만)
export type DeleteUserQuestionResponse = { ok: true };
export async function deleteUserQuestion(token: string, questionId: string) {
  return apiDelete<DeleteUserQuestionResponse>(`/user-questions/${questionId}`, { token });
}
