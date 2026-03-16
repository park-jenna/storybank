"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  fetchCommonQuestions,
  fetchQuestionRecommendations,
  fetchUserQuestions,
  createUserQuestion,
  type Question,
  type Story,
  type UserQuestionItem,
} from "@/lib/user-questions";

function CommonQuestionsContent() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userQuestions, setUserQuestions] = useState<UserQuestionItem[]>([]);
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
  const [expandedStoryIds, setExpandedStoryIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function load() {
      try {
        setError(null);
        const token = localStorage.getItem("token");
        if (!token) {
          router.replace("/login");
          return;
        }
        const [commonData, userData] = await Promise.all([
          fetchCommonQuestions(token),
          fetchUserQuestions(token),
        ]);
        setQuestions(commonData.questions);
        setUserQuestions(userData.userQuestions ?? []);
        if (commonData.questions.length > 0 && !selectedQuestion) {
          setSelectedQuestion(commonData.questions[0]);
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
    setExpandedStoryIds(new Set());
    fetchQuestionRecommendations(token, selectedQuestion.id)
      .then((data) => {
        setRecommendedStories(data.recommendedStories ?? []);
      })
      .catch(() => setRecommendedStories([]))
      .finally(() => setLoadingRecommendations(false));
  }, [selectedQuestion?.id]);

  const linkedStories = useMemo(() => {
    if (!selectedQuestion?.alreadySaved || userQuestions.length === 0) return [];
    const uq = userQuestions.find((uq) => uq.question.content === selectedQuestion.content);
    return uq?.stories ?? [];
  }, [selectedQuestion?.content, selectedQuestion?.alreadySaved, userQuestions]);

  const linkedStoryIds = useMemo(() => new Set(linkedStories.map((s) => s.id)), [linkedStories]);

  const recommendedStoriesFiltered = useMemo(
    () => recommendedStories.filter((s) => !linkedStoryIds.has(s.id)),
    [recommendedStories, linkedStoryIds]
  );

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
      const refreshed = await fetchUserQuestions(token);
      setUserQuestions(refreshed.userQuestions ?? []);
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

  const toggleStoryExpanded = (storyId: string) => {
    setExpandedStoryIds((prev) => {
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

  const hasToken = typeof window !== "undefined" && !!localStorage.getItem("token");

  if (loadingQuestions) {
    return (
      <main className="main-content">
        <p style={{ fontSize: 14, color: "var(--text-muted)" }}>Loading common questions...</p>
      </main>
    );
  }

  if (error && questions.length === 0) {
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
            viewBox="0 0 14 14"
            style={{
              width: 14,
              height: 14,
              fill: "none",
              stroke: "currentColor",
              strokeWidth: 2,
              strokeLinecap: "round",
            }}
            aria-hidden
          >
            <path d="M9 2L4 7l5 5" />
          </svg>
          Saved Questions
        </button>
      </main>
    );
  }

  return (
    <main className="main-content">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Common interview questions</h1>
          <p className="page-subtitle">
            Choose a question to see recommended categories and your matching stories.
            Save to your list and link stories.
          </p>
        </div>
      </div>

      {questions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">❓</div>
          <h3 className="empty-state-title">No common questions</h3>
          <p className="empty-state-desc">There are no common questions in the list yet.</p>
          <Link href="/saved-questions" className="btn-secondary">
            Saved Questions
          </Link>
        </div>
      ) : (
        <div className="common-questions-layout">
          <aside className="common-questions-list" aria-label="Question list">
            <div className="q-list">
              {questions.map((q, i) => (
                <div
                  key={q.id}
                  role="button"
                  tabIndex={0}
                  className={`q-row${selectedQuestion?.id === q.id ? " active" : ""}`}
                  onClick={() => setSelectedQuestion(q)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedQuestion(q);
                    }
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                    <span className="q-row-num">{String(i + 1).padStart(2, "0")}</span>
                    <span className="q-row-text">{q.content}</span>
                  </div>
                  {q.alreadySaved && (
                    <span className="badge badge-saved" aria-label="Saved to your list">
                      Saved
                    </span>
                  )}
                </div>
              ))}
            </div>
          </aside>

          <div className="common-questions-detail">
            {!selectedQuestion ? (
              <div className="common-questions-placeholder" aria-live="polite">
                <p className="common-questions-placeholder-title">Select a question</p>
                <p className="common-questions-placeholder-desc">
                  Choose a question from the list to see recommended categories and your matching stories.
                </p>
              </div>
            ) : (
            <div className="common-questions-detail-inner">
              <div className="common-questions-detail-header">
                <h2 className="common-questions-detail-title">
                  {selectedQuestion.content}
                </h2>
                {selectedQuestion.alreadySaved && (
                  <span className="badge badge-saved" role="status">
                    Saved to your list
                  </span>
                )}
              </div>

              <div className="common-questions-categories">
                <span className="common-questions-categories-label">Good categories to highlight:</span>
                {(selectedQuestion.recommendedCategories ?? []).map((cat) => (
                  <span key={cat} className="tag tag-highlight">
                    {cat}
                  </span>
                ))}
              </div>

              {!hasToken ? (
                <div className="card" style={{ marginTop: 16 }}>
                  <p
                    style={{
                      fontSize: 14,
                      color: "var(--text-muted)",
                      marginBottom: 12,
                    }}
                  >
                    Log in to see your recommended stories and save this question.
                  </p>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => router.replace("/login")}
                  >
                    Log in
                  </button>
                </div>
              ) : (
                <>
                  {selectedQuestion.alreadySaved && (
                    <div
                      style={{ marginBottom: "1.5rem" }}
                      aria-labelledby="linked-stories-heading"
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "baseline",
                          gap: 8,
                          marginBottom: 4,
                        }}
                      >
                        <span
                          className="section-label"
                          id="linked-stories-heading"
                          style={{ marginBottom: 0 }}
                        >
                          LINKED STORIES
                        </span>
                        <span style={{ fontSize: 13, color: "var(--text-hint)" }}>
                          {linkedStories.length}
                        </span>
                      </div>
                      <p
                        style={{
                          fontSize: 13,
                          color: "var(--text-muted)",
                          marginBottom: 12,
                        }}
                      >
                        Stories you linked to this question. These are the ones you plan to use when answering.
                      </p>

                      {linkedStories.length === 0 ? (
                        <p className="no-stories-text">
                          No stories linked yet. Use &quot;Change linked stories&quot; below to link stories.
                        </p>
                      ) : (
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                            gap: 10,
                          }}
                        >
                          {linkedStories.map((s) => {
                            const matchingCategories = (
                              selectedQuestion?.recommendedCategories ?? []
                            ).filter((c) => s.categories.includes(c));
                            return (
                              <Link
                                key={s.id}
                                href={`/stories/${s.id}`}
                                style={{ textDecoration: "none" }}
                              >
                                <div className="story-card">
                                  <div className="story-card-top">
                                    <div className="story-card-title">{s.title}</div>
                                  </div>
                                  {matchingCategories.length > 0 && (
                                    <p className="story-card-matches">
                                      Matches: {matchingCategories.join(", ")}
                                    </p>
                                  )}
                                  <div className="story-card-situation">
                                    {s.result || s.situation || "No summary"}
                                  </div>
                                  <div className="story-card-missing" />
                                  <div className="story-card-cats">
                                    {s.categories.slice(0, 3).map((c) => (
                                      <span
                                        key={c}
                                        className={`tag${(selectedQuestion?.recommendedCategories ?? []).includes(c) ? " tag-highlight" : ""}`}
                                      >
                                        {c}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  <div aria-labelledby="recommended-stories-heading">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: 8,
                        marginBottom: 4,
                      }}
                    >
                      <span
                        className="section-label"
                        id="recommended-stories-heading"
                        style={{ marginBottom: 0 }}
                      >
                        {selectedQuestion.alreadySaved
                          ? "MORE STORIES TO LINK"
                          : "RECOMMENDED STORIES"}
                      </span>
                      <span style={{ fontSize: 13, color: "var(--text-hint)" }}>
                        {recommendedStoriesFiltered.length}
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: 13,
                        color: "var(--text-muted)",
                        marginBottom: 12,
                      }}
                    >
                      {selectedQuestion.alreadySaved
                        ? "Other stories that match this question's categories. Link more to use when answering."
                        : "Your stories that match this question's categories. Link the ones you want to use when answering."}
                    </p>

                    {loadingRecommendations && (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                          gap: 10,
                        }}
                        aria-hidden
                      >
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="skeleton-card">
                            <div
                              className="skeleton skeleton-line"
                              style={{ width: "80%" }}
                            />
                            <div className="skeleton skeleton-line" />
                            <div
                              className="skeleton skeleton-line"
                              style={{ width: "50%" }}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {!loadingRecommendations && recommendedStoriesFiltered.length === 0 && (
                      <div className="empty-state">
                        <div className="empty-state-icon">📚</div>
                        <h3 className="empty-state-title">
                          {selectedQuestion.alreadySaved
                            ? "No other matching stories"
                            : "No matching stories"}
                        </h3>
                        <p className="empty-state-desc">
                          {selectedQuestion.alreadySaved
                            ? "You've linked all matching stories, or no other stories match these categories yet."
                            : "You don't have any stories tagged with these categories yet. Add categories to your stories to see them here."}
                        </p>
                        {!selectedQuestion.alreadySaved && (
                          <Link href="/stories/new" className="btn-primary">
                            + New story
                          </Link>
                        )}
                      </div>
                    )}

                    {!loadingRecommendations && recommendedStoriesFiltered.length > 0 && (
                      <>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                            gap: 10,
                            marginTop: 8,
                          }}
                        >
                          {(showSavePanel && selectedQuestion.alreadySaved
                            ? [...linkedStories, ...recommendedStoriesFiltered]
                            : recommendedStoriesFiltered
                          ).map((s) => {
                            const matchingCategories = (
                              selectedQuestion?.recommendedCategories ?? []
                            ).filter((c) => s.categories.includes(c));
                            return (
                              <div key={s.id}>
                                {showSavePanel ? (
                                  <div
                                    className={`rec-item${selectedStoryIds.has(s.id) ? " selected" : ""}`}
                                    style={{ cursor: "default" }}
                                  >
                                    <div
                                      className="rc-row"
                                      style={{ alignItems: "flex-start" }}
                                    >
                                      <div
                                        className={`rec-check${selectedStoryIds.has(s.id) ? " selected" : ""}`}
                                        style={{
                                          marginTop: 3,
                                          cursor: "pointer",
                                          flexShrink: 0,
                                        }}
                                        onClick={() => toggleStorySelection(s.id)}
                                        role="checkbox"
                                        aria-checked={selectedStoryIds.has(s.id)}
                                        aria-label={
                                          selectedStoryIds.has(s.id)
                                            ? `Unlink "${s.title}" from this question`
                                            : `Link "${s.title}" to this question`
                                        }
                                      >
                                        {selectedStoryIds.has(s.id) ? "✓" : ""}
                                      </div>
                                      <div className="rc-info">
                                        <div
                                          style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            gap: 8,
                                          }}
                                        >
                                          <div className="rc-title">{s.title}</div>
                                          <button
                                            type="button"
                                            onClick={() => toggleStoryExpanded(s.id)}
                                            aria-expanded={expandedStoryIds.has(s.id)}
                                            style={{
                                              fontSize: 12,
                                              color: "var(--text-hint)",
                                              background: "none",
                                              border: "none",
                                              cursor: "pointer",
                                              flexShrink: 0,
                                            }}
                                          >
                                            {expandedStoryIds.has(s.id) ? "▼" : "▶"}
                                          </button>
                                        </div>
                                        {matchingCategories.length > 0 && (
                                          <p
                                            style={{
                                              fontSize: 12,
                                              color: "var(--green-primary)",
                                              marginTop: 3,
                                            }}
                                          >
                                            Matches: {matchingCategories.join(", ")}
                                          </p>
                                        )}
                                        {expandedStoryIds.has(s.id) && (
                                          <div style={{ marginTop: 8 }}>
                                            <p className="rc-sit">
                                              {s.result || s.situation || "No summary"}
                                            </p>
                                            <div className="rc-cats" style={{ marginBottom: 6 }}>
                                              {s.categories.slice(0, 3).map((c) => (
                                                <span
                                                  key={c}
                                                  className={`tag${(selectedQuestion?.recommendedCategories ?? []).includes(c) ? " tag-highlight" : ""}`}
                                                >
                                                  {c}
                                                </span>
                                              ))}
                                            </div>
                                            <Link
                                              href={`/stories/${s.id}`}
                                              className="btn-inline"
                                              style={{ fontSize: 12 }}
                                              onClick={(e) => e.stopPropagation()}
                                            >
                                              View story →
                                            </Link>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <Link
                                    href={`/stories/${s.id}`}
                                    style={{ textDecoration: "none" }}
                                  >
                                    <div className="story-card">
                                      <div className="story-card-top">
                                        <div className="story-card-title">{s.title}</div>
                                      </div>
                                      {matchingCategories.length > 0 && (
                                        <p className="story-card-matches">
                                          Matches: {matchingCategories.join(", ")}
                                        </p>
                                      )}
                                      <div className="story-card-situation">
                                        {s.result || s.situation || "No summary"}
                                      </div>
                                      <div className="story-card-missing" />
                                      <div className="story-card-cats">
                                        {s.categories.slice(0, 3).map((c) => (
                                          <span
                                            key={c}
                                            className={`tag${(selectedQuestion?.recommendedCategories ?? []).includes(c) ? " tag-highlight" : ""}`}
                                          >
                                            {c}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  </Link>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        <div
                          style={{
                            borderTop: "0.5px solid var(--border-card)",
                            paddingTop: 14,
                            marginTop: 14,
                          }}
                        >
                          {!showSavePanel ? (
                            <button
                              type="button"
                              className="btn-secondary"
                              onClick={() => {
                                setShowSavePanel(true);
                                if (selectedQuestion.alreadySaved) {
                                  setSelectedStoryIds(new Set(linkedStories.map((s) => s.id)));
                                }
                              }}
                            >
                              {selectedQuestion.alreadySaved
                                ? "Change linked stories"
                                : "Save to my questions"}
                            </button>
                          ) : (
                            <div className="btn-group">
                              <button
                                type="button"
                                className="btn-primary"
                                disabled={saving}
                                onClick={handleSaveToMyQuestions}
                              >
                                {saving
                                  ? "Saving..."
                                  : selectedQuestion.alreadySaved
                                    ? `Update (${selectedStoryIds.size} selected)`
                                    : `Save (${selectedStoryIds.size} selected)`}
                              </button>
                              <button
                                type="button"
                                className="btn-secondary"
                                onClick={() => {
                                  setShowSavePanel(false);
                                  setSelectedStoryIds(new Set());
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                          {saveSuccess && saveMessage && (
                            <div
                              className="success-msg show"
                              role="status"
                              style={{ marginTop: 10 }}
                            >
                              {saveMessage}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

export default function CommonQuestionsPage() {
  return (
    <Suspense
      fallback={
        <main className="main-content">
          <p style={{ fontSize: 14, color: "var(--text-muted)" }}>Loading...</p>
        </main>
      }
    >
      <CommonQuestionsContent />
    </Suspense>
  );
}
