"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { fetchUserQuestionById, deleteUserQuestion, UserQuestionItem } from "@/lib/user-questions";

type SavedQuestionDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default function SavedQuestionDetailPage({
  params,
}: SavedQuestionDetailPageProps) {
  const router = useRouter();
  const { id: questionId } = use(params);

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
      <main className="main-content">
        <p className="text-muted text-14">Loading question...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="main-content">
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
          Back to Saved Questions
        </button>
      </main>
    );
  }

  if (!userQuestion) {
    return (
      <main className="main-content">
        <div className="card mb-3">
          <p className="text-muted text-14">Question not found.</p>
        </div>
        <button
          type="button"
          className="back-btn"
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
          Back to Saved Questions
        </button>
      </main>
    );
  }

  return (
    <main className="main-content">
      <div className="topbar">
        <button
          type="button"
          className="back-btn"
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
          Back to Saved Questions
        </button>
        <div className="btn-group">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => router.push(`/saved-questions/${userQuestion.id}/edit`)}
          >
            Edit
          </button>
          <button
            type="button"
            className="btn-warn"
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete
          </button>
        </div>
      </div>

      {/* Single card: question + divider + linked stories (one surface, like one detail view) */}
      <div className="card saved-question-detail">
        <header>
          <h1
            style={{
              fontSize: 21,
              fontWeight: 500,
              color: "var(--text-primary)",
              marginBottom: 8,
              lineHeight: 1.3,
            }}
          >
            {userQuestion.question.content}
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-hint)", margin: "0 0 12px" }}>
            Saved:{" "}
            <time dateTime={userQuestion.createdAt}>
              {new Date(userQuestion.createdAt).toLocaleDateString()}
            </time>
          </p>
          {userQuestion.question.recommendedCategories &&
            userQuestion.question.recommendedCategories.length > 0 && (
              <div className="chips-row">
                {userQuestion.question.recommendedCategories.map((c) => (
                  <span key={c} className="tag">
                    {c}
                  </span>
                ))}
              </div>
            )}
        </header>

        <hr className="divider" />

        <section
          className="saved-question-detail__linked"
          aria-labelledby="saved-question-stories-heading"
        >
          <div className="card-head saved-question-detail__linked-head">
            <h2 className="card-title" id="saved-question-stories-heading">
              Linked stories
            </h2>
            <button
              type="button"
              className="btn-secondary btn-size-sm"
              onClick={() => router.push(`/saved-questions/${userQuestion.id}/edit`)}
            >
              Manage links
            </button>
          </div>

          {userQuestion.stories.length > 0 && (
            <p className="saved-question-detail__linked-hint text-muted text-14">
              Stories you practice with for this question. Open one to review your answer.
            </p>
          )}

          {userQuestion.stories.length === 0 ? (
            <p className="card-empty-hint">
              No stories linked yet. Use <strong>Manage links</strong> to choose which stories
              you want here.
            </p>
          ) : (
            <div className="saved-question-detail__story-list">
              {userQuestion.stories.map((s) => (
                <Link
                  key={s.id}
                  href={`/stories/${s.id}`}
                  className="saved-question-detail__story"
                  aria-label={`Open story: ${s.title}`}
                >
                  <div className="saved-question-detail__story-main">
                    <span className="saved-question-detail__story-title">{s.title}</span>
                    {s.categories.length > 0 && (
                      <div className="chips-row">
                        {s.categories.slice(0, 3).map((cat) => (
                          <span key={cat} className="tag">
                            {cat}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="saved-question-detail__story-cta">View →</span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      {showDeleteConfirm && (
        <div
          className="modal-overlay show"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-confirm-title"
        >
          <div className="modal">
            {confirmStep === 1 && !deleting && (
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
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setConfirmStep(1);
                    }}
                  >
                    Cancel
                  </button>
                  <button type="button" className="btn-warn" onClick={handleDelete}>
                    Remove
                  </button>
                </div>
              </>
            )}

            {confirmStep === 2 && !deleting && (
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
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setConfirmStep(1);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn-danger"
                    disabled={deleting}
                    onClick={handleDelete}
                  >
                    Yes, delete
                  </button>
                </div>
              </>
            )}

            {deleting && <p className="modal-deleting">Deleting...</p>}
          </div>
        </div>
      )}
    </main>
  );
}
