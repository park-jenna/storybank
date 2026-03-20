"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { fetchUserQuestionById, updateUserQuestion } from "@/lib/user-questions";
import { fetchStories, Story } from "@/lib/stories";
import { CATEGORIES } from "@/constants/categories";

type EditSavedQuestionPageProps = {
  params: Promise<{ id: string }>;
};

export default function EditSavedQuestionPage({
  params,
}: EditSavedQuestionPageProps) {
  const router = useRouter();
  const { id: questionId } = use(params);

  const [content, setContent] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStoryIds, setSelectedStoryIds] = useState<Set<string>>(new Set());
  const [expandedStoryIds, setExpandedStoryIds] = useState<Set<string>>(new Set());

  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        const [questionRes, storiesRes] = await Promise.all([
          fetchUserQuestionById(token, questionId),
          fetchStories(token),
        ]);
        const uq = questionRes.userQuestion;
        setContent(uq.question.content);
        setSelectedCategories(uq.question.recommendedCategories ?? []);
        setSelectedStoryIds(new Set(uq.stories.map((s) => s.id)));
        setStories(storiesRes.stories);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [questionId, router]);

  function toggleCategory(category: string, checked: boolean) {
    setSelectedCategories((prev) =>
      checked ? [...prev, category] : prev.filter((c) => c !== category)
    );
  }

  function toggleStoryExpanded(storyId: string) {
    setExpandedStoryIds((prev) => {
      const next = new Set(prev);
      if (next.has(storyId)) next.delete(storyId);
      else next.add(storyId);
      return next;
    });
  }

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

  function toggleStory(storyId: string) {
    setSelectedStoryIds((prev) => {
      const next = new Set(prev);
      if (next.has(storyId)) next.delete(storyId);
      else next.add(storyId);
      return next;
    });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found. Please log in again.");
      if (!questionId) throw new Error("No question ID provided.");
      const trimmedContent = content.trim();
      if (!trimmedContent) throw new Error("Question content is required.");
      await updateUserQuestion(token, questionId, {
        content: trimmedContent,
        recommendedCategories: selectedCategories,
        storyIds: Array.from(selectedStoryIds),
      });
      router.push(`/saved-questions/${questionId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update question.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="main-content">
        <p style={{ fontSize: 14, color: "var(--text-muted)" }}>Loading...</p>
      </main>
    );
  }

  if (error && !content && stories.length === 0) {
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

  return (
    <main className="main-content">
      <div className="topbar">
        <button
          type="button"
          className="back-btn"
          onClick={() => router.push(`/saved-questions/${questionId}`)}
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
      <div className="page-header-left" style={{ marginBottom: "1.5rem" }}>
        <h1 className="page-title">Edit Saved Question</h1>
      </div>

      <form onSubmit={handleSave}>
        <div className="card">
          <div className="field">
            <label className="field-label">
              Question <span className="field-required">*</span>
            </label>
            <textarea
              className="textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="E.g., Tell me about a time you had a conflict with a teammate."
              rows={3}
              required
            />
          </div>

          <div className="field">
            <label className="field-label">Categories</label>
            <p className="field-hint">
              Optional. Select one or more categories that match this question.
            </p>
            <div className="chips-row">
              {CATEGORIES.map((category) => {
                const selected = selectedCategories.includes(category);
                return (
                  <label
                    key={category}
                    className={`chip${selected ? " active" : ""}`}
                    style={{ cursor: "pointer" }}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={(e) => toggleCategory(category, e.target.checked)}
                      className="visually-hidden"
                    />
                    {category}
                  </label>
                );
              })}
            </div>
          </div>

          <div className="field">
            <label className="field-label">Linked stories</label>
            <p className="field-hint">
              Choose which stories you want to use to answer this question.
              Click + to link, expand to see details.
            </p>

            {stories.length === 0 ? (
              <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
                You have no stories yet.{" "}
                <Link href="/stories/new" className="btn-inline">
                  Create a story
                </Link>{" "}
                first, then link it here.
              </p>
            ) : (
              <div style={{ marginTop: 8 }} aria-label="Stories to link">
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 8,
                    marginBottom: 4,
                  }}
                >
                  <span className="section-label" style={{ marginBottom: 0 }}>
                    Stories to link
                  </span>
                  <span style={{ fontSize: 13, color: "var(--text-hint)" }}>
                    {selectedStoryIds.size} selected
                  </span>
                </div>
                <p className="field-hint" style={{ marginBottom: 10 }}>
                  Click the + button to link a story to this question; click again to unlink.
                </p>

                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  role="list"
                >
                  {stories.map((s) => {
                    const isSelected = selectedStoryIds.has(s.id);
                    const isExpanded = expandedStoryIds.has(s.id);
                    const matchingCategories = selectedCategories.filter((c) =>
                      s.categories.includes(c)
                    );
                    return (
                      <div
                        key={s.id}
                        className={`rec-item${isSelected ? " selected" : ""}`}
                        style={{ cursor: "default" }}
                        role="listitem"
                      >
                        <div className="rc-row" style={{ alignItems: "flex-start" }}>
                          <div
                            className={`rec-check${isSelected ? " selected" : ""}`}
                            style={{
                              marginTop: 3,
                              cursor: "pointer",
                              flexShrink: 0,
                            }}
                            onClick={() => toggleStory(s.id)}
                            role="checkbox"
                            aria-checked={isSelected}
                            aria-label={
                              isSelected ? `Unlink "${s.title}"` : `Link "${s.title}"`
                            }
                          >
                            {isSelected ? "✓" : ""}
                          </div>

                          <div className="rc-info" style={{ flex: 1, minWidth: 0 }}>
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
                                aria-expanded={isExpanded}
                                style={{
                                  fontSize: 12,
                                  color: "var(--text-hint)",
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  flexShrink: 0,
                                }}
                              >
                                {isExpanded ? "▼" : "▶"}
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

                            {isExpanded && (
                              <div style={{ marginTop: 8 }}>
                                <p
                                  style={{
                                    fontSize: 13,
                                    color: "var(--text-muted)",
                                    lineHeight: 1.5,
                                    marginBottom: 6,
                                  }}
                                >
                                  {s.result || s.situation || "No summary"}
                                </p>
                                <div className="chips-row" style={{ marginBottom: 8 }}>
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
              </div>
            )}
          </div>

          {error && (
            <div
              className="error-banner show"
              role="alert"
              style={{ marginBottom: 12 }}
            >
              Error: {error}
            </div>
          )}

          <div
            className="btn-group"
            style={{
              marginTop: "1.25rem",
              paddingTop: "1.25rem",
              borderTop: "0.5px solid var(--border-card)",
            }}
          >
            <button
              type="submit"
              className="btn-primary"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => router.push(`/saved-questions/${questionId}`)}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}
