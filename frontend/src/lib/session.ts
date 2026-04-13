// frontend/src/lib/session.ts
// 브라우저 세션 계층
// 토큰 저장/삭제, 로그인 리다이렉트, 세션 상태 구독 담당
import { useSyncExternalStore } from "react";

const SESSION_TOKEN_KEY = "token";
const SESSION_TOKEN_EVENT = "storybank:session-token";

type RouterLike = {
  replace: (href: string) => void;
};

function notifySessionTokenChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(SESSION_TOKEN_EVENT));
}

function subscribeToSessionToken(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};

  const onStorage = (event: StorageEvent) => {
    if (event.key === SESSION_TOKEN_KEY || event.key === null) {
      onStoreChange();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(SESSION_TOKEN_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(SESSION_TOKEN_EVENT, onStoreChange);
  };
}

export function getSessionToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SESSION_TOKEN_KEY);
}

export function hasSessionToken(): boolean {
  return !!getSessionToken();
}

export function setSessionToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_TOKEN_KEY, token);
  notifySessionTokenChanged();
}

export function clearSessionToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_TOKEN_KEY);
  notifySessionTokenChanged();
}

export function getCurrentPath(): string | null {
  if (typeof window === "undefined") return null;
  return `${window.location.pathname}${window.location.search}`;
}

export function getLoginHref(returnTo: string | null = getCurrentPath()): string {
  if (!returnTo || !returnTo.startsWith("/") || returnTo.startsWith("//")) {
    return "/login";
  }
  return `/login?returnTo=${encodeURIComponent(returnTo)}`;
}

export function redirectToLogin(
  router: RouterLike,
  returnTo: string | null = getCurrentPath()
): void {
  router.replace(getLoginHref(returnTo));
}

export function useSessionToken(): string | null {
  return useSyncExternalStore(
    subscribeToSessionToken,
    getSessionToken,
    () => null
  );
}
