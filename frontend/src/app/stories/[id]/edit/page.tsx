"use client";

import { use, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchStoryById, Story, updateStoryById } from "@/lib/stories";
import { CATEGORIES } from "@/constants/categories";
import { StarWritingTips } from "@/components/StarWritingTips";
import { useToast } from "@/contexts/ToastContext";

type EditStoryPageProps = {
  params: Promise<{ id: string }>;
};

export default function EditStoryPage({ params }: EditStoryPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { id: storyId } = use(params);

  const [story, setStory] = useState<Story | null>(null);
  const [title, setTitle] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [situation, setSituation] = useState("");
  const [action, setAction] = useState("");
  const [result, setResult] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const fromParam = searchParams.get("from");
  const safeFrom =
    fromParam && fromParam.startsWith("/") && !fromParam.startsWith("//")
      ? fromParam
      : null;

  function handleBack() {
    if (safeFrom) {
      router.push(safeFrom);
      return;
    }
    // Prefer real history when available (feels natural from dashboard/list).
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    // Fallback when the user landed here directly.
    router.push("/dashboard");
  }

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
        if (!storyId) {
          setError("No story ID provided.");
          return;
        }
        const data = await fetchStoryById(token, storyId);
        setStory(data.story);
        setTitle(data.story.title ?? "");
        setSelectedCategories(data.story.categories ?? []);
        setSituation(data.story.situation ?? "");
        setAction(data.story.action ?? "");
        setResult(data.story.result ?? "");
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Failed to load story.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [storyId, router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found. Please log in again.");
      if (!storyId) throw new Error("No story ID provided.");

      const cleanTitle = title.trim();
      if (!cleanTitle) throw new Error("Title is required.");
      if (selectedCategories.length === 0) {
        throw new Error("At least one category is required.");
      }

      await updateStoryById(token, storyId, {
        title: cleanTitle,
        categories: selectedCategories,
        situation: situation.trim(),
        action: action.trim(),
        result: result.trim(),
      });
      showToast("Story saved ✓");
      router.push(`/stories/${storyId}`);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to update story.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  function toggleCategory(category: string, checked: boolean) {
    setSelectedCategories((prev) =>
      checked ? [...prev, category] : prev.filter((c) => c !== category)
    );
  }

  if (loading) {
    return (
      <main className="main-content">
        <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
          Loading story...
        </p>
      </main>
    );
  }

  if (error && !story) {
    return (
      <main className="main-content">
        <div className="error-banner show" role="alert">
          Error: {error}
        </div>
        <button
          type="button"
          className="back-btn"
          style={{ marginTop: 12 }}
          onClick={handleBack}
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
          Back to Stories
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
          onClick={handleBack}
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
        <h1 className="page-title">Edit Story</h1>
        {story && (
          <div className="page-subtitle-editing">
            <span>Editing:</span>
            <span className="editing-badge">{story.title}</span>
          </div>
        )}
      </div>

      <div className="form-grid">
        <form onSubmit={handleSave}>
          <div className="card">
            <div className="field">
              <label className="field-label">
                Title <span className="field-required">*</span>
              </label>
              <input
                className="input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="E.g., Leading a team project"
                required
              />
            </div>

            <div className="field">
              <label className="field-label">
                Categories <span className="field-required">*</span>
              </label>
              <p className="field-hint">
                Select one or more categories that best describe your story.
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
                        onChange={(e) =>
                          toggleCategory(category, e.target.checked)
                        }
                        className="visually-hidden"
                      />
                      {category}
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="star-section-title">✦ STAR breakdown</div>

            <div className="star-field">
              <div className="star-field-label">Situation & Task</div>
              <div className="star-field-sublabel">Context & goal</div>
              <textarea
                className="textarea"
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
                placeholder="What was the context? What was your goal or role?"
                rows={3}
              />
            </div>

            <div className="star-field">
              <div className="star-field-label">Action</div>
              <div className="star-field-sublabel">What you did</div>
              <textarea
                className="textarea"
                value={action}
                onChange={(e) => setAction(e.target.value)}
                placeholder="What did you do? Describe concrete steps."
                rows={3}
              />
            </div>

            <div className="star-field">
              <div className="star-field-label">Result</div>
              <div className="star-field-sublabel">Impact & learning</div>
              <textarea
                className="textarea"
                value={result}
                onChange={(e) => setResult(e.target.value)}
                placeholder="What was the outcome? What did you learn?"
                rows={3}
              />
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
              style={{
                marginTop: "1.25rem",
                paddingTop: "1.25rem",
                borderTop: "0.5px solid var(--border-card)",
              }}
            >
              <div className="btn-group">
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
                  onClick={handleBack}
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </form>

        <StarWritingTips />
      </div>
    </main>
  );
}
