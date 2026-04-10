/**
 * Routes that do not require a session — no redirect to /login when unauthenticated.
 * API 401 handling also skips forced logout redirect on these paths.
 */
export const AUTH_OPTIONAL_PATHS = [
  "/",
  "/login",
  "/signup",
  "/about",
  "/interview-tips",
] as const;

/**
 * Routes that render without the app sidebar (marketing + auth forms).
 * Other auth-optional routes (e.g. interview tips) use the full shell so navigation matches the rest of the app.
 */
export const BARE_LAYOUT_PATHS = ["/", "/login", "/signup", "/about"] as const;

export type AuthOptionalPath = (typeof AUTH_OPTIONAL_PATHS)[number];
export type BareLayoutPath = (typeof BARE_LAYOUT_PATHS)[number];

/** @deprecated Use AUTH_OPTIONAL_PATHS */
export const PUBLIC_PATHS = AUTH_OPTIONAL_PATHS;

export function isAuthOptionalPathname(pathname: string | null): boolean {
  if (!pathname) return false;
  return (AUTH_OPTIONAL_PATHS as readonly string[]).includes(pathname);
}

export function isBareLayoutPathname(pathname: string | null): boolean {
  if (!pathname) return false;
  return (BARE_LAYOUT_PATHS as readonly string[]).includes(pathname);
}

/** True when the route does not require login (same as isAuthOptionalPathname). */
export function isPublicPathname(pathname: string | null): boolean {
  return isAuthOptionalPathname(pathname);
}

export function shouldSkipAuthFailureRedirect(pathname: string): boolean {
  return isAuthOptionalPathname(pathname);
}
