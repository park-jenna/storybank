"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { fetchUserQuestions, deleteUserQuestion, UserQuestionItem } from "@/lib/user-questions";
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
    <main className="saved-questions-page">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <h1 className="text-2xl font-semibold m-0">Saved Questions</h1>
        <Link href="/common-questions">
          <Button variant="default">
            View common interview questions
          </Button>
        </Link>
      </div>

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
          description="Save questions from the common list to see them here."
          action={
            <Button
              variant="primary"
              className="mt-4"
              onClick={() => router.push("/common-questions")}
            >
              View common questions
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          {userQuestions.map((uq) => (
            <Card key={uq.id} variant="default" className="block">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm muted">{formatDate(uq.createdAt)}</span>
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--background-solid)] disabled:opacity-50"
                  disabled={deletingId === uq.id}
                  onClick={() => openDeleteConfirm(uq.id)}
                >
                  {deletingId === uq.id ? "Deleting..." : "Delete"}
                </button>
              </div>
              <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                {uq.question.content}
              </h3>
              {uq.question.recommendedCategories?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {uq.question.recommendedCategories.slice(0, 3).map((cat) => (
                    <Badge key={cat} category={cat} />
                  ))}
                </div>
              )}
              {uq.stories.length > 0 ? (
                <div className="mt-2">
                  <p className="text-sm muted mb-1">
                    Linked stories ({uq.stories.length})
                  </p>
                  <ul className="list-none p-0 m-0 space-y-1">
                    {uq.stories.map((s) => (
                      <li key={s.id}>
                        <Link
                          href={`/stories/${s.id}`}
                          className="text-sm text-[var(--primary)] hover:underline"
                        >
                          {s.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-sm muted mt-2">No stories linked yet.</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
