 "use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  fetchUserQuestions,
  deleteUserQuestion,
  createUserQuestion,
  fetchQuestionRecommendations,
  UserQuestionItem,
  type Story,
} from "@/lib/user-questions";
import { getCommonQuestionIdByContent } from "@/constants/interviewQuestions";
import { CATEGORIES } from "@/constants/categories";

const ALL = "All" as const;

export default function SavedQuestionsPage() {
  const router = useRouter();
  const [userQuestions, setUserQuestions] = useState<UserQuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmStep, setConfirmStep] = useState<1 | 2>(1);

  // Inline link-stories panel (like Common Questions)
  const [linkingUserQuestion, setLinkingUserQuestion] = useState<UserQuestionItem | null>(null);
  const [recommendedStories, setRecommendedStories] = useState<Story[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [selectedStoryIds, setSelectedStoryIds] = useState<Set<string>>(new Set());
  const [expandedStoryIds, setExpandedStoryIds] = useState<Set<string>>(new Set());
  const [savingLinks, setSavingLinks] = useState(false);
  const [saveLinkSuccess, setSaveLinkSuccess] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL);

  useEffect(() => {
    async function load() {
      try {
        setError(null);
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No token found. Please log in again.");
          router.replace("/login");
          return;
        }
        const data = await fetchUserQuestions(token);
        setUserQuestions(data.userQuestions);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load saved questions.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  const commonIdForLinking = linkingUserQuestion
    ? getCommonQuestionIdByContent(linkingUserQuestion.question.content)
    : null;

  useEffect(() => {
    if (!linkingUserQuestion || !commonIdForLinking) {
      setRecommendedStories([]);
      setSelectedStoryIds(new Set());
      setExpandedStoryIds(new Set());
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) return;
    setLoadingRecommendations(true);
    setSelectedStoryIds(new Set(linkingUserQuestion.stories.map((s) => s.id)));
    setExpandedStoryIds(new Set());
    fetchQuestionRecommendations(token, commonIdForLinking)
      .then((data) => setRecommendedStories(data.recommendedStories ?? []))
      .catch(() => setRecommendedStories([]))
      .finally(() => setLoadingRecommendations(false));
  }, [linkingUserQuestion?.id, commonIdForLinking]);

  const linkedStoryIds = useMemo(
    () => new Set(linkingUserQuestion?.stories.map((s) => s.id) ?? []),
    [linkingUserQuestion?.stories]
  );
  const recommendedFiltered = useMemo(
    () => recommendedStories.filter((s) => !linkedStoryIds.has(s.id)),
    [recommendedStories, linkedStoryIds]
  );
  const storiesToShow = useMemo(
    () => [...(linkingUserQuestion?.stories ?? []), ...recommendedFiltered],
    [linkingUserQuestion?.stories, recommendedFiltered]
  );

  const filteredUserQuestions = useMemo(() => {
    if (selectedCategory === ALL) return userQuestions;
    return userQuestions.filter((uq) =>
      (uq.question.recommendedCategories ?? []).includes(selectedCategory)
    );
  }, [userQuestions, selectedCategory]);

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
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

  const handleSaveLinkedStories = async () => {
    if (!commonIdForLinking || !linkingUserQuestion) return;
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }
    setSavingLinks(true);
    setSaveLinkSuccess(false);
    try {
      await createUserQuestion(token, {
        commonQuestionId: commonIdForLinking,
        storyIds: Array.from(selectedStoryIds),
      });
      setSaveLinkSuccess(true);
      const data = await fetchUserQuestions(token);
      setUserQuestions(data.userQuestions);
      setLinkingUserQuestion(
        data.userQuestions.find((uq) => uq.id === linkingUserQuestion.id) ?? null
      );
      setTimeout(() => setSaveLinkSuccess(false), 3000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update linked stories.");
    } finally {
      setSavingLinks(false);
    }
  };

  const openDeleteConfirm = (questionId: string) => {
    setConfirmDeleteId(questionId);
    setConfirmStep(1);
  };

  const closeDeleteConfirm = () => {
    setConfirmDeleteId(null);
    setConfirmStep(1);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteId) return;
    const token = localStorage.getItem("token");
    if (!token) {
      closeDeleteConfirm();
      return;
    }
    if (confirmStep === 1) {
      setConfirmStep(2);
      return;
    }
    try {
      setDeletingId(confirmDeleteId);
      await deleteUserQuestion(token, confirmDeleteId);
      setUserQuestions((prev) => prev.filter((uq) => uq.id !== confirmDeleteId));
      closeDeleteConfirm();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete question.");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  return (
    <main className="main-content">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Saved Questions</h1>
          <p className="page-subtitle">
            Questions you saved and the stories you linked to answer them.
          </p>
        </div>
        <Link
          href="/common-questions"
          className="btn-inline"
          style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12 }}
        >
          Browse common questions
          <svg
            viewBox="0 0 14 14"
            style={{
              width: 13,
              height: 13,
              fill: "none",
              stroke: "currentColor",
              strokeWidth: 2,
              strokeLinecap: "round",
              strokeLinejoin: "round",
            }}
            aria-hidden
          >
            <path d="M3 7h8M7 3l4 4-4 4" />
          </svg>
        </Link>
      </div>

      {userQuestions.length > 0 && !linkingUserQuestion && (
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

      {loading && (
        <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: "1.5rem" }}>
          Loading saved questions...
        </p>
      )}

      {error && (
        <div className="error-banner show" role="alert" style={{ marginTop: 16 }}>
          Error: {error}
        </div>
      )}

      {!loading && !error && userQuestions.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3 className="empty-state-title">No saved questions yet</h3>
          <p className="empty-state-desc">
            Browse the question bank, save the ones you want to practice,
            and link your STAR stories so you&apos;re ready for any interview.
          </p>
          <Link href="/common-questions" className="btn-primary">
            Browse common questions
          </Link>
        </div>
      )}

      {confirmDeleteId && (
        <div
          className="modal-overlay show"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-confirm-title"
        >
          <div className="modal">
            {confirmStep === 1 && deletingId !== confirmDeleteId && (
              <>
                <h3 className="modal-title" id="delete-confirm-title">
                  Remove this question from your list?
                </h3>
                <p className="modal-subtitle">
                  You can always re-save it from the common questions page.
                </p>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={closeDeleteConfirm}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn-warn"
                    onClick={handleConfirmDelete}
                  >
                    Remove
                  </button>
                </div>
              </>
            )}

            {confirmStep === 2 && deletingId !== confirmDeleteId && (
              <>
                <h3 className="modal-title" id="delete-confirm-title">
                  This cannot be undone. Really delete?
                </h3>
                <p className="modal-subtitle">
                  Removing this question will also unlink all stories attached to it.
                </p>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={closeDeleteConfirm}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn-danger"
                    onClick={handleConfirmDelete}
                  >
                    Yes, delete
                  </button>
                </div>
              </>
            )}

            {deletingId === confirmDeleteId && (
              <p className="modal-deleting">Deleting...</p>
            )}
          </div>
        </div>
      )}

      {!loading && !error && filteredUserQuestions.length > 0 && !linkingUserQuestion && (
        <div className="q-card-grid mt-4">
          {filteredUserQuestions.map((uq) => {
            const commonId = getCommonQuestionIdByContent(uq.question.content);
            const maxVisible = 3;
            const visibleStories = uq.stories.slice(0, maxVisible);
            const remainingCount = uq.stories.length - maxVisible;
            return (
              <div key={uq.id} className="q-card">
                <div className="q-card-top">
                  <span className="q-card-date">{formatDate(uq.createdAt)}</span>
                  <details className="q-card-menu">
                    <summary
                      className="q-card-menu-trigger"
                      aria-label="More actions"
                      title="More"
                      onClick={(e) => {
                        // Avoid toggling other click handlers in the card.
                        e.stopPropagation();
                      }}
                    >
                      <span aria-hidden>⋯</span>
                    </summary>
                    <div className="q-card-menu-popover" role="menu">
                      <button
                        type="button"
                        className="q-card-menu-item q-card-menu-item--danger"
                        disabled={deletingId === uq.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          const details = e.currentTarget.closest("details");
                          if (details) details.removeAttribute("open");
                          openDeleteConfirm(uq.id);
                        }}
                      >
                        {deletingId === uq.id ? "Deleting..." : "Remove"}
                      </button>
                    </div>
                  </details>
                </div>

                <Link href={`/saved-questions/${uq.id}`} className="link-unstyled">
                  <div className="q-card-title">{uq.question.content}</div>
                </Link>

                {uq.question.recommendedCategories?.length > 0 && (
                  <div className="chips-row mb-4">
                    {uq.question.recommendedCategories.slice(0, 4).map((cat) => (
                      <span key={cat} className="tag">
                        {cat}
                      </span>
                    ))}
                  </div>
                )}

                <div>
                  <div className="linked-header">
                    <span className="linked-label">
                      Linked stories
                      {uq.stories.length > 0 && (
                        <span className="linked-count">{uq.stories.length}</span>
                      )}
                    </span>
                    {commonId && (
                      <button
                        type="button"
                        className="btn-row btn-row-sm"
                        onClick={() => setLinkingUserQuestion(uq)}
                      >
                        {uq.stories.length > 0 ? "Add more" : "Link stories"}
                      </button>
                    )}
                  </div>

                  {uq.stories.length > 0 ? (
                    <>
                      {visibleStories.map((s) => (
                        <div key={s.id} className="linked-story-item">
                          <div className="linked-story-dot" />
                          <Link href={`/stories/${s.id}`} className="linked-story-name">
                            {s.title}
                          </Link>
                        </div>
                      ))}
                      {remainingCount > 0 && (
                        <button
                          type="button"
                          className="linked-more"
                          style={{
                            background: "none",
                            border: "none",
                            padding: 0,
                            font: "inherit",
                            color: "inherit",
                            cursor: "pointer",
                            textAlign: "left",
                          }}
                          onClick={() => setLinkingUserQuestion(uq)}
                        >
                          +{remainingCount} more — link or change stories here
                        </button>
                      )}
                    </>
                  ) : (
                    <p className="no-stories-text">No stories linked yet.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading &&
        !error &&
        userQuestions.length > 0 &&
        filteredUserQuestions.length === 0 &&
        !linkingUserQuestion && (
          <div className="empty-state" style={{ marginTop: 24 }}>
            <div className="empty-state-icon">🔍</div>
            <h3 className="empty-state-title">No questions in this category</h3>
            <p className="empty-state-desc">
              You don&apos;t have any saved questions tagged with &quot;{selectedCategory}&quot; yet.
              Try another category or save more questions from the common questions page.
            </p>
            <Link href="/common-questions" className="btn-secondary">
              Browse more questions
            </Link>
          </div>
        )}

      {!loading && !error && userQuestions.length > 0 && linkingUserQuestion && (
        <div className="common-questions-layout" style={{ marginTop: 16 }}>
          <aside className="common-questions-list" aria-label="Saved questions">
            <div className="q-list">
              {userQuestions.map((uq) => (
                <div
                  key={uq.id}
                  role="button"
                  tabIndex={0}
                  className={`q-row${linkingUserQuestion?.id === uq.id ? " active" : ""}`}
                  onClick={() => setLinkingUserQuestion(uq)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setLinkingUserQuestion(uq);
                    }
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                    <span className="q-row-text" style={{ fontSize: 13 }}>
                      {uq.question.content}
                    </span>
                  </div>
                  {uq.stories.length > 0 && (
                    <span className="linked-count" style={{ flexShrink: 0 }}>
                      {uq.stories.length}
                    </span>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              className="btn-secondary"
              style={{ marginTop: 12, alignSelf: "flex-start" }}
              onClick={() => setLinkingUserQuestion(null)}
            >
              ← Back to list
            </button>
          </aside>

          <div className="common-questions-detail">
            <div className="common-questions-detail-inner">
              <div className="common-questions-detail-header">
                <h2 className="common-questions-detail-title">
                  {linkingUserQuestion.question.content}
                </h2>
              </div>
              <div className="common-questions-categories">
                <span className="section-label">Good categories to highlight:</span>
                {(linkingUserQuestion.question.recommendedCategories ?? []).map((cat) => (
                  <span key={cat} className="tag">
                    {cat}
                  </span>
                ))}
              </div>

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
                    RECOMMENDED STORIES
                  </span>
                  <span style={{ fontSize: 13, color: "var(--text-hint)" }}>
                    {storiesToShow.length}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--text-muted)",
                    marginBottom: 12,
                  }}
                >
                  Your stories that match this question&apos;s categories. Link the ones you want to use when answering.
                </p>

                {loadingRecommendations && (
                  <div className="rec-stories-grid" aria-hidden>
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="skeleton-card">
                        <div className="skeleton skeleton-line" style={{ width: "80%" }} />
                        <div className="skeleton skeleton-line" />
                        <div className="skeleton skeleton-line" style={{ width: "50%" }} />
                      </div>
                    ))}
                  </div>
                )}

                {!loadingRecommendations && storiesToShow.length === 0 && (
                  <div className="empty-state">
                    <div className="empty-state-icon">📚</div>
                    <h3 className="empty-state-title">No matching stories</h3>
                    <p className="empty-state-desc">
                      You don&apos;t have any stories tagged with these categories yet. Add categories to your stories to see them here.
                    </p>
                    <Link href="/stories/new" className="btn-primary">
                      + New story
                    </Link>
                  </div>
                )}

                {!loadingRecommendations && storiesToShow.length > 0 && (
                  <>
                    <div className="rec-stories-grid rec-stories-grid--mt">
                      {storiesToShow.map((s) => {
                        const matchingCategories = (
                          linkingUserQuestion?.question.recommendedCategories ?? []
                        ).filter((c) => s.categories.includes(c));
                        return (
                          <div
                            key={s.id}
                            className={`rec-item${selectedStoryIds.has(s.id) ? " selected" : ""}`}
                            style={{ cursor: "default" }}
                          >
                            <div className="rc-row" style={{ alignItems: "flex-start" }}>
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
                                        <span key={c} className="tag">
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
                      <div className="btn-group">
                        <button
                          type="button"
                          className="btn-primary"
                          disabled={savingLinks}
                          onClick={handleSaveLinkedStories}
                        >
                          {savingLinks
                            ? "Saving..."
                            : `Save (${selectedStoryIds.size} selected)`}
                        </button>
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => setLinkingUserQuestion(null)}
                        >
                          Cancel
                        </button>
                      </div>
                      {saveLinkSuccess && (
                        <div
                          className="success-msg show"
                          role="status"
                          style={{ marginTop: 10 }}
                        >
                          Linked stories updated.
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
