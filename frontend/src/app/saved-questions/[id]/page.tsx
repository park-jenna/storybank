"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import { fetchUserQuestionById, deleteUserQuestion, UserQuestionItem } from "@/lib/user-questions";

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
      <main className="main-content">
        <p style={{ fontSize: 14, color: "var(--text-muted)" }}>Loading question...</p>
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
          Back to Saved Questions
        </button>
      </main>
    );
  }

  if (!userQuestion) {
    return (
      <main className="main-content">
        <div className="card" style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 14, color: "var(--text-muted)" }}>Question not found.</p>
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

      <div className="card" style={{ marginBottom: 12 }}>
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
        <p style={{ fontSize: 13, color: "var(--text-hint)", marginBottom: 12 }}>
          Saved: {new Date(userQuestion.createdAt).toLocaleDateString()}
        </p>
        {userQuestion.question.recommendedCategories?.length > 0 && (
          <div className="chips-row">
            {userQuestion.question.recommendedCategories.map((c) => (
              <span key={c} className="tag">
                {c}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="card" aria-label="Linked stories">
        <div className="card-head">
          <h2 className="card-title">Linked stories</h2>
        </div>

        {userQuestion.stories.length === 0 ? (
          <p className="no-stories-text">
            No stories linked yet. Edit this question to add story links.
          </p>
        ) : (
          userQuestion.stories.map((s) => (
            <div key={s.id} className="story-row" style={{ cursor: "default" }}>
              <div className="dot dot-done" aria-hidden />
              <div className="story-row-info">
                <Link
                  href={`/stories/${s.id}`}
                  className="story-row-title"
                  style={{ textDecoration: "none" }}
                >
                  {s.title}
                </Link>
                <div className="chips-row" style={{ marginTop: 4 }}>
                  {s.categories.slice(0, 3).map((cat) => (
                    <span key={cat} className="tag">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
              <Link
                href={`/stories/${s.id}`}
                className="btn-inline"
                style={{ fontSize: 12, flexShrink: 0 }}
              >
                View →
              </Link>
            </div>
          ))
        )}

        <div
          style={{
            marginTop: 14,
            paddingTop: 14,
            borderTop: "0.5px solid var(--border-card)",
          }}
        >
          <button
            type="button"
            className="btn-primary"
            onClick={() => router.push(`/saved-questions/${userQuestion.id}/edit`)}
          >
            {userQuestion.stories.length === 0
              ? "Link stories"
              : "Edit / Add or remove stories"}
          </button>
        </div>
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
