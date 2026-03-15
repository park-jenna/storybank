"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  fetchCommonQuestions,
  fetchQuestionRecommendations,
  createUserQuestion,
  type Question,
  type Story,
} from "@/lib/user-questions";
import { getBadgeClass } from "@/constants/categories";
import { Button, Card, Badge, EmptyState } from "@/components/ui";

function CommonQuestionsContent() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [recommendedStories, setRecommendedStories] = useState<Story[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string>("");
  const [selectedStoryIds, setSelectedStoryIds] = useState<Set<string>>(new Set());
  const [showSavePanel, setShowSavePanel] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setError(null);
        const token = localStorage.getItem("token");
        if (!token) {
          router.replace("/login");
          return;
        }
        const data = await fetchCommonQuestions(token);
        setQuestions(data.questions);
        if (data.questions.length > 0 && !selectedQuestion) {
          setSelectedQuestion(data.questions[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load questions.");
      } finally {
        setLoadingQuestions(false);
      }
    }
    load();
  }, [router]);

  useEffect(() => {
    if (!selectedQuestion) {
      setRecommendedStories([]);
      setShowSavePanel(false);
      setSelectedStoryIds(new Set());
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      setRecommendedStories([]);
      return;
    }
    setLoadingRecommendations(true);
    setShowSavePanel(false);
    setSelectedStoryIds(new Set());
    fetchQuestionRecommendations(token, selectedQuestion.id)
      .then((data) => {
        setRecommendedStories(data.recommendedStories ?? []);
      })
      .catch(() => setRecommendedStories([]))
      .finally(() => setLoadingRecommendations(false));
  }, [selectedQuestion?.id]);

  const handleSaveToMyQuestions = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }
    if (!selectedQuestion) return;
    setSaving(true);
    setSaveSuccess(false);
    setSaveMessage("");
    try {
      const res = await createUserQuestion(token, {
        commonQuestionId: selectedQuestion.id,
        storyIds: Array.from(selectedStoryIds),
      });
      setSaveSuccess(true);
      setSaveMessage(res.alreadySaved ? "Already in your list. Linked stories updated." : "Saved to your questions!");
      setShowSavePanel(false);
      setQuestions((prev) =>
        prev.map((q) => (q.id === selectedQuestion.id ? { ...q, alreadySaved: true } : q))
      );
      setTimeout(() => {
        setSaveSuccess(false);
        setSaveMessage("");
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const toggleStorySelection = (storyId: string) => {
    setSelectedStoryIds((prev) => {
      const next = new Set(prev);
      if (next.has(storyId)) next.delete(storyId);
      else next.add(storyId);
      return next;
    });
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return d.toLocaleDateString();
  };

  if (loadingQuestions) {
    return (
      <main className="page-section">
        <p className="muted">Loading common questions...</p>
      </main>
    );
  }

  if (error && questions.length === 0) {
    return (
      <main className="page-section">
        <Card variant="error">
          <p className="form-error m-0">Error: {error}</p>
        </Card>
        <Button className="mt-4" onClick={() => router.push("/saved-questions")}>
          ← Saved Questions
        </Button>
      </main>
    );
  }

  const hasToken = typeof window !== "undefined" && !!localStorage.getItem("token");

  return (
    <main className="questions-page page-section">
      <div className="flex items-center justify-between gap-4 mb-4">
        <h1 className="questions-page-title">Common interview questions</h1>
        <Link href="/saved-questions" className="text-sm text-[var(--primary)] hover:underline">
          ← Saved Questions
        </Link>
      </div>
      <p className="questions-page-subtitle">
        Choose a question to see recommended categories and your matching stories. Save to your list and link stories.
      </p>

      {questions.length === 0 ? (
        <EmptyState
          icon="❓"
          title="No common questions"
          description="There are no common questions in the list yet."
          action={
            <Button className="mt-4" onClick={() => router.push("/saved-questions")}>
              ← Saved Questions
            </Button>
          }
        />
      ) : (
        <div className="questions-layout">
          <aside className="questions-sidebar" aria-label="Question list">
            <p className="questions-list-label">Choose a question</p>
            <ul className="questions-list">
              {questions.map((q) => (
                <li key={q.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedQuestion(q)}
                    className={`questions-list-item ${selectedQuestion?.id === q.id ? "questions-list-item-active" : ""}`}
                  >
                    <span className="questions-list-item-text">{q.content}</span>
                    {q.alreadySaved && (
                      <span className="questions-list-item-saved" aria-label="Saved to your list">
                        Saved
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <section className="questions-main" aria-label="Selected question and recommendations">
            {selectedQuestion ? (
              <>
                <div className="questions-selected-block">
                  {selectedQuestion.alreadySaved && (
                    <span className="questions-selected-saved-badge" role="status">Saved to your list</span>
                  )}
                  <div className="questions-selected-badges">
                    {(selectedQuestion.recommendedCategories ?? []).map((cat) => (
                      <span key={cat} className={`badge ${getBadgeClass(cat)}`}>
                        {cat}
                      </span>
                    ))}
                  </div>
                  <h2 className="questions-selected-title">{selectedQuestion.content}</h2>
                  <p className="questions-selected-hint">
                    Good categories to highlight for this question.
                  </p>
                </div>

                {!hasToken ? (
                  <Card variant="default" className="mt-4 p-4">
                    <p className="muted mb-2">Log in to see your recommended stories and save this question.</p>
                    <Button variant="primary" onClick={() => router.replace("/login")}>
                      Log in
                    </Button>
                  </Card>
                ) : (
                  <>
                    <h3 className="questions-stories-title mt-6">
                      Recommended stories <span className="questions-stories-count">{recommendedStories.length}</span>
                    </h3>

                    {loadingRecommendations && <p className="muted text-sm">Loading...</p>}

                    {!loadingRecommendations && recommendedStories.length === 0 && (
                      <EmptyState
                        icon="📚"
                        title="No matching stories"
                        description="You don't have any stories tagged with these categories yet. Add categories to your stories to see them here."
                        action={
                          <Button variant="primary" className="mt-4" onClick={() => router.push("/stories/new")}>
                            + New Story
                          </Button>
                        }
                      />
                    )}

                    {!loadingRecommendations && recommendedStories.length > 0 && (
                      <ul className="questions-stories-grid mt-2">
                        {recommendedStories.map((s) => (
                          <li key={s.id}>
                            {showSavePanel ? (
                              <label className="questions-story-link flex items-start gap-3 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={selectedStoryIds.has(s.id)}
                                  onChange={() => toggleStorySelection(s.id)}
                                  className="mt-1"
                                />
                                <article className="questions-story-card flex-1">
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
                                  </div>
                                </article>
                              </label>
                            ) : (
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
                                  </div>
                                </article>
                              </Link>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}

                    {hasToken && !loadingRecommendations && (
                      <div className="mt-6 flex flex-wrap items-center gap-3">
                        {!showSavePanel ? (
                          <Button
                            variant="primary"
                            onClick={() => setShowSavePanel(true)}
                          >
                            {selectedQuestion.alreadySaved
                              ? "Change linked stories"
                              : "Save to my questions"}
                          </Button>
                        ) : (
                          <>
                            <Button
                              variant="primary"
                              disabled={saving}
                              onClick={handleSaveToMyQuestions}
                            >
                              {saving
                                ? "Saving..."
                                : selectedQuestion.alreadySaved
                                  ? `Update linked stories (${selectedStoryIds.size} selected)`
                                  : `Save (${selectedStoryIds.size} story selected)`}
                            </Button>
                            <Button variant="default" onClick={() => { setShowSavePanel(false); setSelectedStoryIds(new Set()); }}>
                              Cancel
                            </Button>
                          </>
                        )}
                        {saveSuccess && saveMessage && <span className="text-sm text-[var(--accent-green)]">{saveMessage}</span>}
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              <div className="questions-empty" aria-live="polite">
                <div className="questions-empty-icon" aria-hidden>?</div>
                <p className="questions-empty-text">Select a question from the list.</p>
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}

export default function CommonQuestionsPage() {
  return (
    <Suspense
      fallback={
        <main className="page-section">
          <p className="muted">Loading...</p>
        </main>
      }
    >
      <CommonQuestionsContent />
    </Suspense>
  );
}
