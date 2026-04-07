"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createStory } from "@/lib/stories";
import { CATEGORIES } from "@/constants/categories";
import { StarWritingTips } from "@/components/StarWritingTips";

export default function NewStoryPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [situation, setSituation] = useState("");
  const [action, setAction] = useState("");
  const [result, setResult] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leaveConfirmHref, setLeaveConfirmHref] = useState<string | null>(null);

  const skipLeaveGuardRef = useRef(false);

  const isDirty = useMemo(
    () =>
      title.trim().length > 0 ||
      selectedCategories.length > 0 ||
      situation.trim().length > 0 ||
      action.trim().length > 0 ||
      result.trim().length > 0,
    [title, selectedCategories, situation, action, result]
  );

  const requestNavigate = useCallback(
    (href: string) => {
      if (!isDirty || skipLeaveGuardRef.current) {
        router.push(href);
        return;
      }
      setLeaveConfirmHref(href);
    },
    [isDirty, router]
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace(
        `/login?returnTo=${encodeURIComponent("/stories/new")}`
      );
    }
  }, [router]);

  useEffect(() => {
    if (!isDirty || skipLeaveGuardRef.current) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    const onClickCapture = (e: MouseEvent) => {
      if (!isDirty || skipLeaveGuardRef.current) return;
      if (e.defaultPrevented) return;
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }
      const target = e.target as HTMLElement | null;
      const a = target?.closest("a[href]");
      if (!a || !(a instanceof HTMLAnchorElement)) return;
      if (a.target === "_blank" || a.hasAttribute("download")) return;
      const rawHref = a.getAttribute("href");
      if (!rawHref || rawHref.startsWith("#")) return;
      let url: URL;
      try {
        url = new URL(rawHref, window.location.origin);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      const next = `${url.pathname}${url.search}`;
      const current = `${window.location.pathname}${window.location.search}`;
      if (next === current) return;
      e.preventDefault();
      e.stopPropagation();
      setLeaveConfirmHref(next);
    };
    document.addEventListener("click", onClickCapture, true);
    return () => document.removeEventListener("click", onClickCapture, true);
  }, [isDirty]);

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
      skipLeaveGuardRef.current = true;
      router.push("/dashboard");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to create story.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="main-content">
      <div className="topbar">
        <button
          type="button"
          className="back-btn"
          onClick={() => requestNavigate("/stories")}
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
                  onClick={() => requestNavigate("/stories")}
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

        <StarWritingTips />
      </div>

      {leaveConfirmHref && (
        <div
          className="modal-overlay show"
          role="dialog"
          aria-modal="true"
          aria-labelledby="leave-new-story-title"
        >
          <div className="modal">
            <h3 className="modal-title" id="leave-new-story-title">
              Leave without saving?
            </h3>
            <p className="modal-subtitle">
              You have started this story. If you leave now, your draft will be
              lost.
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setLeaveConfirmHref(null)}
              >
                Keep editing
              </button>
              <button
                type="button"
                className="btn-warn"
                onClick={() => {
                  if (!leaveConfirmHref) return;
                  skipLeaveGuardRef.current = true;
                  const href = leaveConfirmHref;
                  setLeaveConfirmHref(null);
                  router.push(href);
                }}
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
