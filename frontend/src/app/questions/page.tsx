"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * Legacy route: interview question browser now lives at /common-questions.
 * Keeps old /questions and /questions?q=… links working.
 */
function QuestionsRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get("q");

  useEffect(() => {
    const dest = q
      ? `/common-questions?q=${encodeURIComponent(q)}`
      : "/common-questions";
    router.replace(dest);
  }, [router, q]);

  return (
    <main className="main-content">
      <p style={{ fontSize: 14, color: "var(--text-muted)" }}>Redirecting…</p>
    </main>
  );
}

export default function QuestionsPage() {
  return (
    <Suspense
      fallback={
        <main className="main-content">
          <p style={{ fontSize: 14, color: "var(--text-muted)" }}>Loading…</p>
        </main>
      }
    >
      <QuestionsRedirect />
    </Suspense>
  );
}
