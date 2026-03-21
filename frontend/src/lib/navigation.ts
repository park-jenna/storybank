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
