"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import { fetchUserQuestionById, updateUserQuestion } from "@/lib/user-questions";
import { fetchStories, Story } from "@/lib/stories";
import { CATEGORIES } from "@/constants/categories";
import { Button, Card, FormField, Textarea, Badge } from "@/components/ui";

export default function EditSavedQuestionPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const questionId = params?.id;

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
      <main className="page-section">
        <p className="muted">Loading...</p>
      </main>
    );
  }

  if (error && !content && stories.length === 0) {
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

  return (
    <main className="page-section">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="story-form-title">Edit Saved Question</h1>
        <Button type="button" onClick={() => router.push(`/saved-questions/${questionId}`)}>
          ← Back
        </Button>
      </header>

      <form onSubmit={handleSave} className="story-form-card">
        <FormField label="Question" required>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="E.g., Tell me about a time you had a conflict with a teammate."
            rows={3}
            required
          />
        </FormField>

        <FormField
          label="Categories"
          hint="Optional. Select one or more categories that match this question."
        >
          <div className="story-form-chips">
            {CATEGORIES.map((category) => {
              const selected = selectedCategories.includes(category);
              return (
                <label
                  key={category}
                  className={`chip story-form-chip ${selected ? "chip-selected" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={(e) => toggleCategory(category, e.target.checked)}
                    className="sr-only"
                  />
                  {category}
                </label>
              );
            })}
          </div>
        </FormField>

        <FormField
          label="Linked stories"
          hint="Choose which stories you want to use to answer this question. Click + to link, expand to see details."
        >
          {stories.length === 0 ? (
            <p className="muted">
              You have no stories yet.{" "}
              <Link href="/stories/new" className="text-[var(--primary)] hover:underline">
                Create a story
              </Link>{" "}
              first, then link it here.
            </p>
          ) : (
            <section className="questions-recommended-section mt-2" aria-label="Stories to link">
              <div className="questions-recommended-header">
                <h3 className="questions-stories-title">
                  Stories to link
                  <span className="questions-stories-count">{selectedStoryIds.size}</span>
                </h3>
                <p className="questions-recommended-desc">
                  Click the + button to link a story to this question; click again to unlink.
                </p>
              </div>
              <ul className="questions-stories-grid mt-2" role="list">
                {stories.map((s) => {
                  const matchingCategories = selectedCategories.filter((c) =>
                    s.categories.includes(c)
                  );
                  return (
                    <li key={s.id}>
                      <div
                        className={`questions-story-select-card ${selectedStoryIds.has(s.id) ? "questions-story-select-card--selected" : ""}`}
                      >
                        <div className="questions-story-select-row">
                          <button
                            type="button"
                            onClick={() => toggleStory(s.id)}
                            className={`questions-story-select-toggle-btn ${selectedStoryIds.has(s.id) ? "questions-story-select-toggle-btn--selected" : ""}`}
                            aria-pressed={selectedStoryIds.has(s.id)}
                            aria-label={selectedStoryIds.has(s.id) ? `Unlink "${s.title}"` : `Link "${s.title}"`}
                          >
                            <span className="questions-story-select-toggle-btn-icon" aria-hidden>
                              {selectedStoryIds.has(s.id) ? "✓" : "+"}
                            </span>
                          </button>
                          <button
                            type="button"
                            className="questions-story-select-toggle"
                            onClick={() => toggleStoryExpanded(s.id)}
                            aria-expanded={expandedStoryIds.has(s.id)}
                          >
                            <span className="questions-story-select-title">{s.title}</span>
                            <span className="questions-story-select-chevron" aria-hidden>
                              {expandedStoryIds.has(s.id) ? "▼" : "▶"}
                            </span>
                          </button>
                        </div>
                        {matchingCategories.length > 0 && (
                          <p className="questions-story-match-hint">
                            Matches: {matchingCategories.join(", ")}
                          </p>
                        )}
                        {expandedStoryIds.has(s.id) && (
                          <div className="questions-story-select-detail">
                            <time className="questions-story-card-date">
                              {formatDate(s.createdAt)}
                            </time>
                            <p className="questions-story-card-summary">
                              {s.result || s.situation || "No summary"}
                            </p>
                            <div className="questions-story-card-badges">
                              {s.categories.slice(0, 3).map((c) => (
                                <Badge key={c} category={c} />
                              ))}
                            </div>
                            <Link
                              href={`/stories/${s.id}`}
                              className="questions-story-view-link"
                              onClick={(e) => e.stopPropagation()}
                            >
                              View story →
                            </Link>
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </FormField>

        {error && (
          <p className="form-error" role="alert">
            Error: {error}
          </p>
        )}

        <div className="story-form-actions">
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
          <Button
            type="button"
            onClick={() => router.push(`/saved-questions/${questionId}`)}
            disabled={saving}
          >
            Cancel
          </Button>
        </div>
      </form>
    </main>
  );
}
