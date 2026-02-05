// frontend/src/lib/auth.ts
// 도메일/API layer (업무 로직)
// 어떤 API 를 호출할지 결정
// 인증 관련 API 호출 함수들
import { apiPost } from './api';

export type AuthResponse = {
    user: { id: string; email: string };
    token: string;
};

export async function login(email: string, password: string) {
    return apiPost<AuthResponse>('/auth/login', { email, password });
}

export async function signup(email: string, password: string) {
    return apiPost<AuthResponse>('/auth/signup', { email, password });
}