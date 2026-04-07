import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Legacy `/questions` and `/questions?q=…` → `/common-questions` (query preserved). */
export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/common-questions";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/questions"],
};
