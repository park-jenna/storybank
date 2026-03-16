"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { fetchUserQuestions, deleteUserQuestion, UserQuestionItem } from "@/lib/user-questions";
import { getCommonQuestionIdByContent } from "@/constants/interviewQuestions";

export default function SavedQuestionsPage() {
  const router = useRouter();
  const [userQuestions, setUserQuestions] = useState<UserQuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmStep, setConfirmStep] = useState<1 | 2>(1);

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

      {loading && (
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: "1.5rem" }}>
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

      {!loading && !error && userQuestions.length > 0 && (
        <div className="q-card-grid" style={{ marginTop: 16 }}>
          {userQuestions.map((uq) => {
            const commonId = getCommonQuestionIdByContent(uq.question.content);
            const maxVisible = 3;
            const visibleStories = uq.stories.slice(0, maxVisible);
            const remainingCount = uq.stories.length - maxVisible;
            return (
              <div key={uq.id} className="q-card">
                <div className="q-card-top">
                  <span className="q-card-date">{formatDate(uq.createdAt)}</span>
                  <button
                    type="button"
                    className="del-btn"
                    disabled={deletingId === uq.id}
                    onClick={() => openDeleteConfirm(uq.id)}
                    aria-label="Remove this question from saved list"
                    title="Remove from saved"
                  >
                    {deletingId === uq.id ? "Deleting..." : "Remove"}
                  </button>
                </div>

                <Link href={`/saved-questions/${uq.id}`} style={{ textDecoration: "none" }}>
                  <div className="q-card-title">{uq.question.content}</div>
                </Link>

                {uq.question.recommendedCategories?.length > 0 && (
                  <div className="chips-row" style={{ marginBottom: 14 }}>
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
                      <Link href={`/common-questions?q=${commonId}`} className="btn-inline">
                        {uq.stories.length > 0 ? "Add more" : "Link stories"}
                      </Link>
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
                        <Link
                          href={commonId ? `/common-questions?q=${commonId}` : "/common-questions"}
                          className="linked-more"
                        >
                          +{remainingCount} more — manage in Common questions
                        </Link>
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
    </main>
  );
}
