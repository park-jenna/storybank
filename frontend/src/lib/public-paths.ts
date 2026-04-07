/** Routes that do not require auth and render without the app sidebar shell. */
export const PUBLIC_PATHS = [
  "/",
  "/login",
  "/signup",
  "/about",
  "/interview-tips",
] as const;

export type PublicPath = (typeof PUBLIC_PATHS)[number];

export function isPublicPathname(pathname: string | null): boolean {
  if (!pathname) return false;
  return (PUBLIC_PATHS as readonly string[]).includes(pathname);
}

/** After clearing an invalid token, skip forcing navigation to /login on these paths. */
export function shouldSkipAuthFailureRedirect(pathname: string): boolean {
  if (pathname === "/login" || pathname === "/signup") return true;
  return isPublicPathname(pathname);
}
