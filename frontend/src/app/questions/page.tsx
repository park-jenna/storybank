"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchStories, Story } from "@/lib/stories";
import { INTERVIEW_QUESTIONS, getQuestionById } from "@/constants/interviewQuestions";

function QuestionsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("q") ?? null;

  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(
    () => highlightId ?? INTERVIEW_QUESTIONS[0]?.id ?? null
  );

  useEffect(() => {
    if (highlightId) setSelectedQuestionId(highlightId);
  }, [highlightId]);

  useEffect(() => {
    async function load() {
      try {
        setError(null);
        const token = localStorage.getItem("token");
        if (!token) {
          router.replace("/login");
          return;
        }
        const data = await fetchStories(token);
        setStories(data.stories);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load stories.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  const selectedQuestion = selectedQuestionId ? getQuestionById(selectedQuestionId) : null;

  const matchingStories = useMemo(() => {
    if (!selectedQuestion) return [];
    const allowed = new Set(selectedQuestion.categories);
    return stories.filter((s) => s.categories.some((c) => allowed.has(c)));
  }, [stories, selectedQuestion]);

  if (loading) {
    return (
      <main className="main-content">
        <p style={{ fontSize: 14, color: "var(--text-muted)" }}>Loading common questions...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="main-content">
        <div className="error-banner show" role="alert">
          Error: {error}
        </div>
        <button
          type="button"
          className="back-btn"
          style={{ marginTop: 12 }}
          onClick={() => router.push("/saved-questions")}
        >
          <svg
            viewBox="0 0 24 24"
            width={14}
            height={14}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Saved Questions
        </button>
      </main>
    );
  }

  return (
    <main className="main-content">
      <div className="topbar">
        <button
          type="button"
          className="back-btn"
          onClick={() => router.push("/saved-questions")}
        >
          <svg
            viewBox="0 0 14 14"
            width={14}
            height={14}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M9 2L4 7l5 5" />
          </svg>
          Saved Questions
        </button>
      </div>
      <h1 className="page-title">Common interview questions</h1>
      <p className="page-subtitle" style={{ marginBottom: "1.5rem" }}>
        Choose a question to see recommended categories and your matching stories.
      </p>

      <div className="q-list">
        {INTERVIEW_QUESTIONS.map((q, i) => (
          <div
            key={q.id}
            role="button"
            tabIndex={0}
            className={`q-row${selectedQuestionId === q.id ? " active" : ""}`}
            onClick={() => setSelectedQuestionId(q.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setSelectedQuestionId(q.id);
              }
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
              <span className="q-row-num">{String(i + 1).padStart(2, "0")}</span>
              <span className="q-row-text">{q.text}</span>
            </div>
          </div>
        ))}
      </div>

      {!selectedQuestion ? (
        <div
          style={{ textAlign: "center", padding: "3rem 2rem" }}
          aria-live="polite"
        >
          <h3
            style={{
              fontSize: 15,
              fontWeight: 500,
              color: "var(--text-muted)",
              marginBottom: 6,
            }}
          >
            Select a question from the list
          </h3>
          <p
            style={{
              fontSize: 14,
              color: "var(--text-hint)",
              lineHeight: 1.6,
            }}
          >
            Choose a question above to see recommended categories and your matching stories.
          </p>
        </div>
      ) : (
        <>
          <hr className="divider" />

          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 16,
              marginBottom: "1.25rem",
            }}
          >
            <h2
              style={{
                fontSize: 18,
                fontWeight: 500,
                color: "var(--text-primary)",
                lineHeight: 1.4,
                flex: 1,
              }}
            >
              {selectedQuestion.text}
            </h2>
          </div>

          <div className="common-questions-categories">
            <span className="section-label">Good categories to highlight:</span>
            {selectedQuestion.categories.map((cat) => (
              <span key={cat} className="tag">
                {cat}
              </span>
            ))}
          </div>

          {matchingStories.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📚</div>
              <h3 className="empty-state-title">No matching stories</h3>
              <p className="empty-state-desc">
                You don&apos;t have any stories tagged with{" "}
                {selectedQuestion.categories.length === 1
                  ? `"${selectedQuestion.categories[0]}"`
                  : "any of these categories"}{" "}
                yet.
              </p>
              <Link href="/stories/new" className="btn-primary">
                + New story
              </Link>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 10,
              }}
            >
              {matchingStories.map((s) => (
                <Link
                  key={s.id}
                  href={`/stories/${s.id}`}
                  style={{ textDecoration: "none" }}
                >
                  <div className="story-card">
                    <div className="story-card-top">
                      <div className="story-card-title">{s.title}</div>
                    </div>
                    <div className="story-card-situation">
                      {s.situation || s.result || "No summary"}
                    </div>
                    <div className="story-card-missing" />
                    <div className="story-card-cats">
                      {s.categories.slice(0, 3).map((c) => (
                        <span key={c} className="tag">
                          {c}
                        </span>
                      ))}
                      {s.categories.length > 3 && (
                        <span className="tag">+{s.categories.length - 3}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}

export default function QuestionsPage() {
  return (
    <Suspense
      fallback={
        <main className="main-content">
          <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
            Loading common questions...
          </p>
        </main>
      }
    >
      <QuestionsPageContent />
    </Suspense>
  );
}
