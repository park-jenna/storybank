"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createStory } from "@/lib/stories";
import { CATEGORIES } from "@/constants/categories";

export default function NewStoryPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [situation, setSituation] = useState("");
  const [action, setAction] = useState("");
  const [result, setResult] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleCategory(category: string, checked: boolean) {
    setSelectedCategories((prev) =>
      checked ? [...prev, category] : prev.filter((c) => c !== category)
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found. Please log in again.");
      }

      const cleanTitle = title.trim();
      if (!cleanTitle) throw new Error("Title is required.");
      if (selectedCategories.length === 0) {
        throw new Error("At least one category is required.");
      }

      await createStory(token, {
        title: cleanTitle,
        categories: selectedCategories,
        situation: situation.trim(),
        action: action.trim(),
        result: result.trim(),
      });
      router.push("/dashboard");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to create story.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  const STAR_TIPS = [
    {
      label: "Situation & Task",
      text: "Describe the context and your goal in 2–3 sentences. Be clear about your role and what needed to be achieved.",
    },
    {
      label: "Action",
      text: "Outline 3–5 concrete steps you took. Focus on what you said and did, not the team.",
    },
    {
      label: "Result",
      text: 'Keep it short: outcomes, numbers, and what you learned. e.g. "Improved X by 20% and learned Y."',
    },
  ];

  return (
    <main className="main-content">
      <div className="topbar">
        <button
          type="button"
          className="back-btn"
          onClick={() => router.push("/stories")}
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
      </div>
      <div className="page-header-left" style={{ marginBottom: "1.5rem" }}>
        <h1 className="page-title">New Story</h1>
        <p className="page-subtitle">
          Create a new behavioral interview story.
        </p>
      </div>

      <div className="form-grid">
        <form onSubmit={handleSubmit}>
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
                {error}
              </div>
            )}

            <div
              style={{
                marginTop: "1.25rem",
                paddingTop: "1.25rem",
                borderTop: "0.5px solid var(--border-card)",
              }}
            >
              <div className="btn-group" style={{ marginBottom: 10 }}>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Create Story"}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => router.push("/stories")}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
              <p className="field-hint">
                After creating the story, you can edit and refine it from the dashboard.
              </p>
            </div>
          </div>
        </form>

        <div className="card" aria-label="STAR method tips">
          <h3
            className="card-title"
            style={{
              marginBottom: 14,
              paddingBottom: 10,
              borderBottom: "0.5px solid var(--border-card)",
            }}
          >
            STAR writing tips
          </h3>
          {STAR_TIPS.map((tip, i) => (
            <div
              key={tip.label}
              style={{
                marginBottom: i < 2 ? 12 : 8,
                paddingBottom: i < 2 ? 12 : 8,
                borderBottom:
                  i < 2 ? "0.5px solid var(--border-card)" : "none",
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "var(--green-primary)",
                  marginBottom: 4,
                }}
              >
                {tip.label}
              </div>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  lineHeight: 1.6,
                }}
              >
                {tip.text}
              </p>
            </div>
          ))}
          <p className="field-hint" style={{ fontStyle: "italic" }}>
            Summarize so you can tell this story in 1–2 minutes in an interview.
          </p>
        </div>
      </div>
    </main>
  );
}
