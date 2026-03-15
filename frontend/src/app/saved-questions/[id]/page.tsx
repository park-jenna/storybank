"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import { fetchUserQuestionById, deleteUserQuestion, UserQuestionItem } from "@/lib/user-questions";
import { getBadgeClass } from "@/constants/categories";
import { Button, Card, Badge } from "@/components/ui";

export default function SavedQuestionDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const questionId = params?.id;

  const [userQuestion, setUserQuestion] = useState<UserQuestionItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [confirmStep, setConfirmStep] = useState<1 | 2>(1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
        if (!questionId) {
          setError("No question ID provided.");
          return;
        }
        const data = await fetchUserQuestionById(token, questionId);
        setUserQuestion(data.userQuestion);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load question.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [questionId, router]);

  const handleDelete = async () => {
    if (!questionId) return;
    if (confirmStep === 1) {
      setConfirmStep(2);
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      setDeleting(true);
      await deleteUserQuestion(token, questionId);
      router.push("/saved-questions");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete question.");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
      setConfirmStep(1);
    }
  };

  if (loading) {
    return (
      <main className="page-section">
        <p className="muted">Loading question...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="page-section">
        <Card variant="error">
          <p className="form-error">Error: {error}</p>
        </Card>
        <div className="mt-4">
          <Button onClick={() => router.push("/saved-questions")}>← Back to Saved Questions</Button>
        </div>
      </main>
    );
  }

  if (!userQuestion) {
    return (
      <main className="page-section">
        <Card className="p-6">
          <p className="m-0">Question not found.</p>
        </Card>
        <div className="mt-4">
          <Button onClick={() => router.push("/saved-questions")}>← Back to Saved Questions</Button>
        </div>
      </main>
    );
  }

  return (
    <main className="page-section">
      <header className="story-detail-header">
        <div className="story-detail-header-top">
          <Button onClick={() => router.push("/saved-questions")}>← Back to Saved Questions</Button>
          <div className="story-detail-actions">
            <Button onClick={() => router.push(`/saved-questions/${userQuestion.id}/edit`)}>
              Edit
            </Button>
            <Button
              variant="danger"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete
            </Button>
          </div>
        </div>
        <h1 className="story-detail-title saved-question-detail-title">
          {userQuestion.question.content}
        </h1>
        <div className="story-detail-meta">
          <p className="muted story-detail-date">
            Saved: {new Date(userQuestion.createdAt).toLocaleDateString()}
          </p>
          {userQuestion.question.recommendedCategories?.length > 0 && (
            <div className="story-detail-categories">
              {userQuestion.question.recommendedCategories.map((c) => (
                <span key={c} className={`badge ${getBadgeClass(c)}`}>
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      <section className="saved-question-detail-section" aria-label="Linked stories">
        <h2 className="page-section-title">Linked stories</h2>
        {userQuestion.stories.length === 0 ? (
          <p className="muted">No stories linked yet. Edit this question to add story links.</p>
        ) : (
          <ul className="saved-question-detail-stories" role="list">
            {userQuestion.stories.map((s) => (
              <li key={s.id}>
                <Link href={`/stories/${s.id}`} className="saved-question-detail-story-link">
                  <span className="saved-question-detail-story-title">{s.title}</span>
                  <div className="saved-question-detail-story-badges">
                    {s.categories.slice(0, 3).map((cat) => (
                      <Badge key={cat} category={cat} />
                    ))}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4">
          <Button
            variant="primary"
            onClick={() => router.push(`/saved-questions/${userQuestion.id}/edit`)}
          >
            {userQuestion.stories.length === 0 ? "Link stories" : "Edit / Add or remove stories"}
          </Button>
        </div>
      </section>

      {showDeleteConfirm && (
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
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setConfirmStep(1);
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant={confirmStep === 2 ? "danger" : "primary"}
                disabled={deleting}
                onClick={handleDelete}
              >
                {deleting ? "Deleting..." : confirmStep === 1 ? "Remove" : "Yes, delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
