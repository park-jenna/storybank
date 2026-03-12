"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchStories, Story } from "@/lib/stories";
import { INTERVIEW_QUESTIONS, getQuestionById } from "@/constants/interviewQuestions";
import { getBadgeClass } from "@/constants/categories";
import { Button, Card, Badge, EmptyState } from "@/components/ui";

export default function QuestionsPage() {
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

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  if (loading) {
    return (
      <main className="page-section">
        <p className="muted">Loading...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="page-section">
        <Card variant="error">
          <p className="form-error m-0">Error: {error}</p>
        </Card>
        <Button className="mt-4" onClick={() => router.push("/dashboard")}>
          ← Dashboard
        </Button>
      </main>
    );
  }

  return (
    <main className="questions-page page-section">
      <h1 className="questions-page-title">Interview questions</h1>
      <p className="questions-page-subtitle">
        Pick a question to see which stories you can use to answer it.
      </p>

      <div className="questions-layout">
        <aside className="questions-sidebar" aria-label="Question list">
          <p className="questions-list-label">Choose a question</p>
          <ul className="questions-list">
            {INTERVIEW_QUESTIONS.map((q) => (
              <li key={q.id}>
                <button
                  type="button"
                  onClick={() => setSelectedQuestionId(q.id)}
                  className={`questions-list-item ${selectedQuestionId === q.id ? "questions-list-item-active" : ""}`}
                >
                  {q.text}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className="questions-main" aria-label="Selected question and matching stories">
          {selectedQuestion ? (
            <>
              <div className="questions-selected-block">
                <div className="questions-selected-badges">
                  {selectedQuestion.categories.map((cat) => (
                    <span key={cat} className={`badge ${getBadgeClass(cat)}`}>
                      {cat}
                    </span>
                  ))}
                </div>
                <h2 className="questions-selected-title">{selectedQuestion.text}</h2>
                <p className="questions-selected-hint">
                  Stories tagged with <strong>any of these</strong> can answer this question.
                </p>
              </div>

              <h3 className="questions-stories-title">
                Your stories <span className="questions-stories-count">{matchingStories.length}</span>
              </h3>

              {matchingStories.length === 0 ? (
                <EmptyState
                  icon="📚"
                  title="No matching stories"
                  description={`You don't have any stories tagged with ${selectedQuestion.categories.length === 1 ? `"${selectedQuestion.categories[0]}"` : "any of these categories"} yet. Add one to a story to use it here.`}
                  action={
                    <Button variant="primary" className="mt-4" onClick={() => router.push("/stories/new")}>
                      + New Story
                    </Button>
                  }
                />
              ) : (
                <ul className="questions-stories-grid">
                  {matchingStories.map((s) => (
                    <li key={s.id}>
                      <Link href={`/stories/${s.id}`} className="questions-story-link">
                        <article className="questions-story-card">
                          <div className="questions-story-card-top">
                            <h4 className="questions-story-card-title">{s.title}</h4>
                            <time className="questions-story-card-date">{formatDate(s.createdAt)}</time>
                          </div>
                          <p className="questions-story-card-summary">
                            {s.result || s.situation || "No summary"}
                          </p>
                          <div className="questions-story-card-badges">
                            {s.categories.slice(0, 3).map((c) => (
                              <Badge key={c} category={c} />
                            ))}
                            {s.categories.length > 3 && (
                              <span className="badge badge-primary">+{s.categories.length - 3}</span>
                            )}
                          </div>
                        </article>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <div className="questions-empty" aria-live="polite">
              <div className="questions-empty-icon" aria-hidden>?</div>
              <p className="questions-empty-text">
                Select a question from the list to see which of your stories you can use to answer it.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
