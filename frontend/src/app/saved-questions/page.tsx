"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { fetchUserQuestions, deleteUserQuestion, UserQuestionItem } from "@/lib/user-questions";
import { getCommonQuestionIdByContent } from "@/constants/interviewQuestions";
import { Button, Card, Badge, EmptyState } from "@/components/ui";

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
    <main className="saved-questions-page page-section">
      <div className="saved-questions-page-header">
        <h1 className="saved-questions-page-title">Saved Questions</h1>
        <Link href="/common-questions" className="saved-questions-nav-link">
          Browse common questions
          <span className="saved-questions-nav-link-arrow" aria-hidden>→</span>
        </Link>
      </div>
      <p className="saved-questions-page-desc muted">
        Questions you saved and the stories you linked to answer them.
      </p>

      {loading && <p className="muted mt-6">Loading saved questions...</p>}

      {error && (
        <Card variant="error" className="mt-4">
          <p className="form-error m-0">Error: {error}</p>
        </Card>
      )}

      {!loading && !error && userQuestions.length === 0 && (
        <EmptyState
          icon="📋"
          title="No saved questions yet"
          description="Browse the question bank, save the ones you want to practice, and link your STAR stories so you're ready for any interview."
          action={
            <Button
              variant="primary"
              className="mt-4"
              onClick={() => router.push("/common-questions")}
            >
              Browse common questions
            </Button>
          }
        />
      )}

      {confirmDeleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-confirm-title"
        >
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-lg)] p-6 shadow-lg max-w-md w-full mx-4">
            <h2 id="delete-confirm-title" className="text-lg font-semibold mb-2">
              {confirmStep === 1
                ? "Remove this question from your list?"
                : "This cannot be undone. Really delete?"}
            </h2>
            <div className="flex gap-3 justify-end mt-4">
              <Button
                type="button"
                variant="default"
                onClick={closeDeleteConfirm}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant={confirmStep === 2 ? "danger" : "primary"}
                disabled={deletingId === confirmDeleteId}
                onClick={handleConfirmDelete}
              >
                {deletingId === confirmDeleteId
                  ? "Deleting..."
                  : confirmStep === 1
                    ? "Remove"
                    : "Yes, delete"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && userQuestions.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4 saved-questions-grid">
          {userQuestions.map((uq) => {
            const commonId = getCommonQuestionIdByContent(uq.question.content);
            const maxVisible = 3;
            const visibleStories = uq.stories.slice(0, maxVisible);
            const remainingCount = uq.stories.length - maxVisible;
            return (
              <Card key={uq.id} variant="default" className="saved-questions-card">
                <div className="saved-questions-card-header">
                  <span className="saved-questions-card-date muted">{formatDate(uq.createdAt)}</span>
                  <button
                    type="button"
                    className="saved-questions-card-delete"
                    disabled={deletingId === uq.id}
                    onClick={() => openDeleteConfirm(uq.id)}
                    aria-label="Remove this question from saved list"
                    title="Remove from saved"
                  >
                    {deletingId === uq.id ? (
                      <span className="saved-questions-card-delete-text">Deleting...</span>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                        <path d="M10 11v6M14 11v6" />
                      </svg>
                    )}
                  </button>
                </div>
                <h3 className="saved-questions-card-title">
                  {uq.question.content}
                </h3>
                {uq.question.recommendedCategories?.length > 0 && (
                  <div className="saved-questions-card-badges">
                    {uq.question.recommendedCategories.slice(0, 4).map((cat) => (
                      <Badge key={cat} category={cat} />
                    ))}
                  </div>
                )}
                <div className="saved-questions-linked">
                  <div className="saved-questions-linked-head">
                    <span className="saved-questions-linked-label">
                      Linked stories
                      {uq.stories.length > 0 && (
                        <span className="saved-questions-linked-count">{uq.stories.length}</span>
                      )}
                    </span>
                    {commonId && (
                      <Link href={`/common-questions?q=${commonId}`} className="saved-questions-linked-cta">
                        {uq.stories.length > 0 ? "Add more" : "Link stories"}
                      </Link>
                    )}
                  </div>
                  {uq.stories.length > 0 ? (
                    <>
                      <ul className="saved-questions-linked-list" role="list">
                        {visibleStories.map((s) => (
                          <li key={s.id}>
                            <Link href={`/stories/${s.id}`} className="saved-questions-linked-link">
                              {s.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                      {remainingCount > 0 && (
                        <p className="saved-questions-linked-more muted">
                          +{remainingCount} more —{" "}
                          {commonId && (
                            <Link href={`/common-questions?q=${commonId}`} className="saved-questions-linked-cta-inline">
                              manage in Common questions
                            </Link>
                          )}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="saved-questions-linked-empty muted">No stories linked yet.</p>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}
