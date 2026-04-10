"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { fetchUserQuestions, deleteUserQuestion, UserQuestionItem } from "@/lib/user-questions";
import { CATEGORIES } from "@/constants/categories";
import { useToast } from "@/contexts/ToastContext";

const ALL = "All" as const;

export default function SavedQuestionsPage() {
  const router = useRouter();
  const [userQuestions, setUserQuestions] = useState<UserQuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmStep, setConfirmStep] = useState<1 | 2>(1);

  const [selectedCategory, setSelectedCategory] = useState<string>(ALL);
  const { showToast } = useToast();

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

  const filteredUserQuestions = useMemo(() => {
    if (selectedCategory === ALL) return userQuestions;
    return userQuestions.filter((uq) =>
      (uq.question.recommendedCategories ?? []).includes(selectedCategory)
    );
  }, [userQuestions, selectedCategory]);

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
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
      showToast("Question removed");
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
      <div className="page-shell page-shell--wide">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Saved Questions</h1>
          <p className="page-subtitle">
            Questions you saved and the stories you linked to answer them.
          </p>
        </div>
        <Link
          href="/common-questions"
          className="btn-inline btn-inline--with-icon text-12"
        >
          Browse common questions
          <svg viewBox="0 0 14 14" className="inline-icon inline-icon--sm" aria-hidden>
            <path d="M3 7h8M7 3l4 4-4 4" />
          </svg>
        </Link>
      </div>

      {userQuestions.length > 0 && (
        <div className="chips-row chips-row--section">
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
        <div aria-hidden="true" aria-busy="true" className="section-stack-lg">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton-card skeleton-card--compact">
              <div className="skeleton skeleton-line skeleton-line--w70-h15" />
              <div className="skeleton skeleton-line skeleton-line--w45" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="error-banner show mt-4" role="alert">
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

      {!loading && !error && filteredUserQuestions.length > 0 && (
        <div className="card saved-questions-list mt-4" role="list">
          {filteredUserQuestions.map((uq) => {
            const n = uq.stories.length;
            return (
              <div key={uq.id} className="saved-q-row" role="listitem">
                <div className="saved-q-row-main">
                  <Link
                    href={`/saved-questions/${uq.id}`}
                    className="link-unstyled saved-q-row-link"
                  >
                    <span className="saved-q-row-title">{uq.question.content}</span>
                  </Link>
                  <span className="saved-q-row-date">{formatDate(uq.createdAt)}</span>
                </div>
                <div className="saved-q-row-side">
                  <span
                    className={`saved-q-count${n === 0 ? " saved-q-count--empty" : ""}`}
                    aria-label={
                      n === 0
                        ? "0 stories linked"
                        : `${n} ${n === 1 ? "story" : "stories"} linked`
                    }
                  >
                    {n === 0 ? "0 linked" : `${n} linked`}
                  </span>
                  <details className="q-card-menu">
                    <summary
                      className="q-card-menu-trigger"
                      aria-label="More actions"
                      title="More"
                      onClick={(e) => e.stopPropagation()}
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
              </div>
            );
          })}
        </div>
      )}

      {!loading &&
        !error &&
        userQuestions.length > 0 &&
        filteredUserQuestions.length === 0 && (
        <div className="empty-state empty-state--spaced">
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

      </div>
    </main>
  );
}
