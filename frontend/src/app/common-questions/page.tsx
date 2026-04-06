 "use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { safeInternalReturnPath } from "@/lib/navigation";
import {
  fetchCommonQuestions,
  fetchQuestionRecommendations,
  fetchUserQuestions,
  createUserQuestion,
  deleteUserQuestion,
  type Question,
  type Story,
  type UserQuestionItem,
} from "@/lib/user-questions";
import { CATEGORIES } from "@/constants/categories";

const ALL = "All" as const;

function storyDetailHref(storyId: string) {
  return `/stories/${storyId}?returnTo=${encodeURIComponent("/common-questions")}`;
}

const MAX_CATEGORY_TAGS_ON_CARD = 3;

/** Recommended categories first, then the rest (preserves order within each group). */
function orderedStoryCategories(categories: string[], recommended: string[]): string[] {
  const rec = new Set(recommended);
  const matches = categories.filter((c) => rec.has(c));
  const rest = categories.filter((c) => !rec.has(c));
  return [...matches, ...rest];
}

function StoryCategoryTagsRow({
  categories,
  recommendedCategories,
  maxVisible,
}: {
  categories: string[];
  recommendedCategories: string[];
  maxVisible: number;
}) {
  const ordered = orderedStoryCategories(categories, recommendedCategories);
  const visible = ordered.slice(0, maxVisible);
  const moreCount = Math.max(0, ordered.length - maxVisible);
  return (
    <>
      {visible.map((c) => (
        <span
          key={c}
          className={`tag${recommendedCategories.includes(c) ? " tag-match" : ""}`}
        >
          {c}
        </span>
      ))}
      {moreCount > 0 && (
        <span className="tag tag-more" aria-label={`${moreCount} more categories`}>
          +{moreCount}
        </span>
      )}
    </>
  );
}

/** Full ordered list (e.g. expanded detail) — no +N truncation. */
function StoryCategoryTagsAll({
  categories,
  recommendedCategories,
}: {
  categories: string[];
  recommendedCategories: string[];
}) {
  const ordered = orderedStoryCategories(categories, recommendedCategories);
  return (
    <>
      {ordered.map((c) => (
        <span
          key={c}
          className={`tag${recommendedCategories.includes(c) ? " tag-match" : ""}`}
        >
          {c}
        </span>
      ))}
    </>
  );
}

function CommonQuestionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const questionIdFromUrl = searchParams.get("q");
  const returnToPath = safeInternalReturnPath(searchParams.get("returnTo"));

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
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL);
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    action?: {
      label: string;
      kind: "undo-save" | "undo-unsave";
      questionId: string;
      userQuestionId?: string;
      storyIds?: string[];
    };
  }>({ open: false, message: "" });
  const [showEmptySaveConfirm, setShowEmptySaveConfirm] = useState(false);
  const [emptySaveConfirmTarget, setEmptySaveConfirmTarget] = useState<{
    kind: "bookmark" | "panel";
    question: Question;
  } | null>(null);

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
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load questions.");
      } finally {
        setLoadingQuestions(false);
      }
    }
    load();
  }, [router]);

  useEffect(() => {
    if (questions.length === 0) return;
    if (questionIdFromUrl) {
      const fromUrl = questions.find((qu) => qu.id === questionIdFromUrl);
      setSelectedQuestion(fromUrl ?? questions[0]);
      return;
    }
    setSelectedQuestion((prev) => prev ?? questions[0]);
  }, [questions, questionIdFromUrl]);

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

  const filteredQuestions = useMemo(() => {
    if (selectedCategory === ALL) return questions;
    return questions.filter((q) =>
      (q.recommendedCategories ?? []).includes(selectedCategory)
    );
  }, [questions, selectedCategory]);

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

  const showToast = (next: typeof toast) => {
    setToast(next);
    if (!next.open) return;
    window.setTimeout(() => {
      setToast((prev) => (prev.open ? { ...prev, open: false } : prev));
    }, 3500);
  };

  const refreshUserQuestions = async (token: string) => {
    const refreshed = await fetchUserQuestions(token);
    setUserQuestions(refreshed.userQuestions ?? []);
  };

  const openEmptySaveConfirm = (target: { kind: "bookmark" | "panel"; question: Question }) => {
    setEmptySaveConfirmTarget(target);
    setShowEmptySaveConfirm(true);
  };

  const performSaveWithoutStories = async (q: Question) => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const res = await createUserQuestion(token, { commonQuestionId: q.id, storyIds: [] });
      setQuestions((prev) => prev.map((x) => (x.id === q.id ? { ...x, alreadySaved: true } : x)));
      if (selectedQuestion?.id === q.id) {
        setSelectedQuestion((prev) => (prev ? { ...prev, alreadySaved: true } : prev));
      }
      await refreshUserQuestions(token);
      showToast({
        open: true,
        message: "Saved",
        action: { label: "Undo", kind: "undo-save", questionId: q.id, userQuestionId: res.userQuestion.id },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update saved state.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleSaved = async (q: Question) => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    const uq = userQuestions.find((x) => x.question.content === q.content) ?? null;
    const isSaved = !!q.alreadySaved && !!uq;

    if (!isSaved) {
      openEmptySaveConfirm({ kind: "bookmark", question: q });
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await deleteUserQuestion(token, uq.id);
      setQuestions((prev) => prev.map((x) => (x.id === q.id ? { ...x, alreadySaved: false } : x)));
      if (selectedQuestion?.id === q.id) {
        setSelectedQuestion((prev) => (prev ? { ...prev, alreadySaved: false } : prev));
        setShowSavePanel(false);
        setSelectedStoryIds(new Set());
      }
      const prevStoryIds = uq.stories.map((s) => s.id);
      await refreshUserQuestions(token);
      showToast({
        open: true,
        message: "Removed from saved",
        action: { label: "Undo", kind: "undo-unsave", questionId: q.id, storyIds: prevStoryIds },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update saved state.");
    } finally {
      setSaving(false);
    }
  };

  const handleToastAction = async () => {
    const action = toast.action;
    if (!action) return;
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (action.kind === "undo-save" && action.userQuestionId) {
        await deleteUserQuestion(token, action.userQuestionId);
        setQuestions((prev) =>
          prev.map((x) => (x.id === action.questionId ? { ...x, alreadySaved: false } : x))
        );
        if (selectedQuestion?.id === action.questionId) {
          setSelectedQuestion((prev) => (prev ? { ...prev, alreadySaved: false } : prev));
        }
        await refreshUserQuestions(token);
        setToast({ open: false, message: "" });
      }
      if (action.kind === "undo-unsave") {
        const res = await createUserQuestion(token, {
          commonQuestionId: action.questionId,
          storyIds: action.storyIds ?? [],
        });
        setQuestions((prev) =>
          prev.map((x) => (x.id === action.questionId ? { ...x, alreadySaved: true } : x))
        );
        if (selectedQuestion?.id === action.questionId) {
          setSelectedQuestion((prev) => (prev ? { ...prev, alreadySaved: true } : prev));
        }
        await refreshUserQuestions(token);
        showToast({
          open: true,
          message: "Restored",
          action: { label: "Undo", kind: "undo-save", questionId: action.questionId, userQuestionId: res.userQuestion.id },
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to undo.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveToMyQuestions = async (opts?: { skipEmptyConfirm?: boolean }) => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }
    if (!selectedQuestion) return;
    if (selectedStoryIds.size === 0) {
      if (!opts?.skipEmptyConfirm) {
        openEmptySaveConfirm({ kind: "panel", question: selectedQuestion });
        return;
      }
    }
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
      await refreshUserQuestions(token);
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

  const hasToken = typeof window !== "undefined" && !!localStorage.getItem("token");

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    if (!selectedQuestion) return;
    // 현재 선택된 질문이 필터 후 목록에 없으면 선택 해제
    const stillVisible = (cat === ALL ? questions : filteredQuestions).some(
      (q) => q.id === selectedQuestion.id
    );
    if (!stillVisible) {
      setSelectedQuestion(null);
    }
  };

  if (loadingQuestions) {
    return (
      <main className="main-content">
        <div className="page-shell page-shell--wide">
          <p className="text-muted text-14">Loading common questions...</p>
        </div>
      </main>
    );
  }

  if (error && questions.length === 0) {
    return (
      <main className="main-content">
        <div className="page-shell page-shell--wide">
          <div className="error-banner show" role="alert">
            Error: {error}
          </div>
          <button
            type="button"
            className="back-btn mt-3"
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
        </div>
      </main>
    );
  }

  return (
    <main className="main-content">
      <div className="page-shell page-shell--wide">
      {returnToPath && (
        <div className="topbar">
          <button
            type="button"
            className="back-btn"
            onClick={() => router.push(returnToPath)}
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
            Back
          </button>
        </div>
      )}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Common interview questions</h1>
          <p className="page-subtitle">
            A built-in list of typical behavioral interview prompts. Pick one to see which
            story categories fit and which of your saved stories might answer it—then bookmark
            the question or link specific stories for practice.
          </p>
        </div>
      </div>

      {questions.length > 0 && (
        <div className="chips-row" style={{ marginBottom: "0.5rem" }}>
          {[ALL, ...CATEGORIES].map((cat) => (
            <div
              key={cat}
              role="button"
              tabIndex={0}
              className={`chip${selectedCategory === cat ? " active" : ""}`}
              onClick={() => handleSelectCategory(cat)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleSelectCategory(cat);
                }
              }}
            >
              {cat}
            </div>
          ))}
        </div>
      )}

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
              {filteredQuestions.map((q, i) => (
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
                  <button
                    type="button"
                    className={`bookmark-btn bookmark-btn--list${q.alreadySaved ? " saved" : ""}`}
                    aria-pressed={!!q.alreadySaved}
                    aria-label={q.alreadySaved ? "Remove from saved" : "Save to your list"}
                    disabled={saving}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleSaved(q);
                    }}
                  >
                    <svg viewBox="0 0 20 20" aria-hidden className="bookmark-icon">
                      <path
                        d="M6.5 3.5h7a2 2 0 0 1 2 2V17l-5.5-3-5.5 3V5.5a2 2 0 0 1 2-2z"
                      />
                    </svg>
                  </button>
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
                <button
                  type="button"
                  className={`bookmark-btn bookmark-btn--header${selectedQuestion.alreadySaved ? " saved" : ""}`}
                  aria-pressed={!!selectedQuestion.alreadySaved}
                  aria-label={selectedQuestion.alreadySaved ? "Remove from saved" : "Save to your list"}
                  disabled={saving}
                  onClick={() => handleToggleSaved(selectedQuestion)}
                >
                  <svg viewBox="0 0 20 20" aria-hidden className="bookmark-icon">
                    <path
                      d="M6.5 3.5h7a2 2 0 0 1 2 2V17l-5.5-3-5.5 3V5.5a2 2 0 0 1 2-2z"
                    />
                  </svg>
                  <span className="bookmark-label">{selectedQuestion.alreadySaved ? "Saved" : "Save"}</span>
                </button>
              </div>

              <div className="common-questions-categories">
                <span className="section-label">Good categories to highlight:</span>
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
                        <p className="no-stories-callout">
                          No stories linked yet. Select stories below to link them to this question.
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
                            return (
                              <Link
                                key={s.id}
                                href={storyDetailHref(s.id)}
                                className="link-unstyled"
                              >
                                <div className="story-card">
                                  <div className="story-card-top">
                                    <div className="story-card-title">{s.title}</div>
                                  </div>
                                  <div className="story-card-situation">
                                    {s.result || s.situation || "No summary"}
                                  </div>
                                  <div className="story-card-missing" />
                                  <div className="story-card-cats">
                                    <StoryCategoryTagsRow
                                      categories={s.categories}
                                      recommendedCategories={
                                        selectedQuestion?.recommendedCategories ?? []
                                      }
                                      maxVisible={MAX_CATEGORY_TAGS_ON_CARD}
                                    />
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
                                        {/* Matches text removed; tags below show ✓ for matches */}
                                        {expandedStoryIds.has(s.id) && (
                                          <div style={{ marginTop: 8 }}>
                                            <p className="rc-sit">
                                              {s.result || s.situation || "No summary"}
                                            </p>
                                            <div className="rc-cats" style={{ marginBottom: 6 }}>
                                              <StoryCategoryTagsAll
                                                categories={s.categories}
                                                recommendedCategories={
                                                  selectedQuestion?.recommendedCategories ?? []
                                                }
                                              />
                                            </div>
                                            <Link
                                              href={storyDetailHref(s.id)}
                                              className="btn-inline text-12"
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
                                    href={storyDetailHref(s.id)}
                                    className="link-unstyled"
                                  >
                                    <div className="story-card">
                                      <div className="story-card-top">
                                        <div className="story-card-title">{s.title}</div>
                                      </div>
                                      <div className="story-card-situation">
                                        {s.result || s.situation || "No summary"}
                                      </div>
                                      <div className="story-card-missing" />
                                      <div className="story-card-cats">
                                        <StoryCategoryTagsRow
                                          categories={s.categories}
                                          recommendedCategories={
                                            selectedQuestion?.recommendedCategories ?? []
                                          }
                                          maxVisible={MAX_CATEGORY_TAGS_ON_CARD}
                                        />
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
                              className="btn-primary"
                              onClick={() => {
                                setShowSavePanel(true);
                                if (selectedQuestion.alreadySaved) {
                                  setSelectedStoryIds(new Set(linkedStories.map((s) => s.id)));
                                }
                              }}
                            >
                              {selectedQuestion.alreadySaved
                                ? "Change linked stories"
                                : "Link stories"}
                            </button>
                          ) : (
                            <div className="btn-group">
                              <button
                                type="button"
                                className="btn-primary"
                                disabled={saving}
                                onClick={() => handleSaveToMyQuestions()}
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

      <div className={`toast${toast.open ? " show" : ""}`} role="status" aria-live="polite">
        <span>{toast.message}</span>
        {toast.action && (
          <button type="button" className="toast-action" onClick={handleToastAction}>
            {toast.action.label}
          </button>
        )}
      </div>

      {showEmptySaveConfirm && emptySaveConfirmTarget && (
        <div
          className="modal-overlay show"
          role="dialog"
          aria-modal="true"
          aria-labelledby="empty-save-confirm-title"
        >
          <div className="modal">
            <h3 className="modal-title" id="empty-save-confirm-title">
              Save without linking stories?
            </h3>
            <p className="modal-subtitle">
              You can link stories later, but saving without any stories may make it harder to use this question in interviews.
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setShowEmptySaveConfirm(false);
                  setEmptySaveConfirmTarget(null);
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={async () => {
                  const target = emptySaveConfirmTarget;
                  setShowEmptySaveConfirm(false);
                  setEmptySaveConfirmTarget(null);
                  if (!target) return;
                  if (target.kind === "bookmark") {
                    await performSaveWithoutStories(target.question);
                    return;
                  }
                  await handleSaveToMyQuestions({ skipEmptyConfirm: true });
                }}
              >
                Save anyway
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </main>
  );
}

export default function CommonQuestionsPage() {
  return (
    <Suspense
      fallback={
        <main className="main-content">
          <p className="text-muted text-14">Loading...</p>
        </main>
      }
    >
      <CommonQuestionsContent />
    </Suspense>
  );
}
