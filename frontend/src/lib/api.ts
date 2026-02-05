// frontend/src/lib/api.ts
// 통신 계층 (네트워크 공통 규칙)
// 실제 fetch 수행 담당
// 에러처리, JSON 처리, 공통 헤더 설정 등
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

type ApiOptions = {
    token?: string;
};

export async function apiPost<T>(
    endpoint: string, 
    body: unknown,
    options?: ApiOptions
): Promise<T> {

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };

    // token 이 options 에서 제공된 경우에만 Authorization 헤더 추가
    if (options?.token) {
        headers["Authorization"] = `Bearer ${options.token}`;
    }

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
    });

    // 서버가 JSON 응답을 반환하지 않는 경우를 대비하여 안전장치
    const data = await res.json().catch(() => null);

    if (!res.ok) {
        const msg = data?.error ?? `Error ${res.status}`;
        throw new Error(msg);
    }

    return data as T;
}

// GET 요청에 대한 공통 함수
// "통신 방식"만 담당
export async function apiGet<T>(endpoint: string, token?: string): Promise<T> {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "GET",
        // token 이 제공된 경우에만 Authorization 헤더 추가
        // 제공되지 않은 경우 headers 필드를 undefined 로 설정
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
        const msg = data?.error ?? `Error ${res.status}`;
        throw new Error(msg);
    }

    return data as T;
} 

// DELETE 요청에 대한 공통 함수
export async function apiDelete<T>(
    endpoint: string,
    options?: { token?: string }
): Promise<T> {
    const headers: Record<string, string> = {};

    if (options?.token) {
        headers["Authorization"] = `Bearer ${options.token}`;
    }

    // DELETE 요청 수행
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "DELETE",
        headers,
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
        const msg = data?.error ?? `Error ${res.status}`;
        throw new Error(msg);
    }

    return data as T;
}

// PATCH 요청에 대한 공통 함수
// 리소스의 일부를 업데이트할 때 사용
export async function apiPatch<T>(
    endpoint: string,
    body: unknown,
    options?: { token?: string }
): Promise<T> {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };

    if (options?.token) {
        headers["Authorization"] = `Bearer ${options.token}`;
    }

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
        const msg = data?.error ?? `Error ${res.status}`;
        throw new Error(msg);
    }

    return data as T;
}