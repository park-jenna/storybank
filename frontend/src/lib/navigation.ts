/** Safe internal path for `returnTo` query (blocks open redirects). */
export function safeInternalReturnPath(raw: string | null): string | null {
  if (!raw) return null;
  try {
    const decoded = decodeURIComponent(raw);
    if (decoded.startsWith("/") && !decoded.startsWith("//")) {
      return decoded;
    }
  } catch {
    // ignore malformed encoding
  }
  return null;
}

/** After login or signup, navigate here when `returnTo` is present and safe. */
export function postAuthDestinationFromWindow(): string {
  if (typeof window === "undefined") return "/dashboard";
  const params = new URLSearchParams(window.location.search);
  return safeInternalReturnPath(params.get("returnTo")) ?? "/dashboard";
}
