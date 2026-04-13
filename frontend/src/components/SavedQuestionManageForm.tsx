"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { updateUserQuestion, type UserQuestionItem } from "@/lib/user-questions";
import { fetchStories, type Story } from "@/lib/stories";
import { CATEGORIES } from "@/constants/categories";

const MAX_CATEGORY_TAGS_ON_ROW = 3;

/** Question categories first, then the rest (same idea as Common Questions). */
function orderedStoryCategories(categories: string[], recommended: string[]): string[] {
  const rec = new Set(recommended);
  const matches = categories.filter((c) => rec.has(c));
  const rest = categories.filter((c) => !rec.has(c));
  return [...matches, ...rest];
}

type SavedQuestionManageFormProps = {
  questionId: string;
  userQuestion: UserQuestionItem;
  onClose: () => void;
  onSaved: () => void | Promise<void>;
};

export function SavedQuestionManageForm({
  questionId,
  userQuestion,
  onClose,
  onSaved,
}: SavedQuestionManageFormProps) {
  const [content, setContent] = useState(userQuestion.question.content);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    userQuestion.question.recommendedCategories ?? []
  );
  const [selectedStoryIds, setSelectedStoryIds] = useState<Set<string>>(
    () => new Set(userQuestion.stories.map((s) => s.id))
  );
  const [expandedStoryIds, setExpandedStoryIds] = useState<Set<string>>(new Set());

  const [stories, setStories] = useState<Story[]>([]);
  const [loadingStories, setLoadingStories] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categoriesKey = [...(userQuestion.question.recommendedCategories ?? [])]
    .sort()
    .join("\0");
  const linkedIdsKey = userQuestion.stories.map((s) => s.id).sort().join("\0");

  useEffect(() => {
    setContent(userQuestion.question.content);
    setSelectedCategories([...(userQuestion.question.recommendedCategories ?? [])]);
    setSelectedStoryIds(new Set(userQuestion.stories.map((s) => s.id)));
  }, [userQuestion.id, userQuestion.question.content, categoriesKey, linkedIdsKey]);

  useEffect(() => {
    let cancelled = false;
    async function loadStories() {
      setLoadingStories(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await fetchStories(token);
        if (!cancelled) setStories(res.stories);
      } catch {
        if (!cancelled) setStories([]);
      } finally {
        if (!cancelled) setLoadingStories(false);
      }
    }
    loadStories();
    return () => {
      cancelled = true;
    };
  }, [questionId]);

  function toggleCategory(category: string) {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
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

  function toggleStory(storyId: string) {
    setSelectedStoryIds((prev) => {
      const next = new Set(prev);
      if (next.has(storyId)) next.delete(storyId);
      else next.add(storyId);
      return next;
    });
  }

  const suggestedStories = useMemo(() => {
    if (selectedCategories.length === 0) {
      return stories;
    }
    return stories.filter((s) => {
      const matchesQuestionCategory = selectedCategories.some((c) => s.categories.includes(c));
      return matchesQuestionCategory || selectedStoryIds.has(s.id);
    });
  }, [stories, selectedCategories, selectedStoryIds]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found. Please log in again.");
      const trimmedContent = content.trim();
      if (!trimmedContent) throw new Error("Question content is required.");
      await updateUserQuestion(token, questionId, {
        content: trimmedContent,
        recommendedCategories: selectedCategories,
        storyIds: Array.from(selectedStoryIds),
      });
      await onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update question.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave}>
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
        <div className="chips-row" role="group" aria-label="Question categories">
          {CATEGORIES.map((category) => {
            const selected = selectedCategories.includes(category);
            return (
              <button
                key={category}
                type="button"
                aria-pressed={selected}
                className={`chip${selected ? " active" : ""}`}
                onClick={() => toggleCategory(category)}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      <div className="field">
        <label className="field-label">Linked stories</label>
        <p className="field-hint">
          When this question has categories, only stories that share at least one of those tags are
          listed (plus any you have already checked to link). Check to link (or uncheck to unlink).
          Use the chevron for full STAR text.
        </p>

        {loadingStories && (
          <p className="text-muted text-14" style={{ marginTop: 8 }}>
            Loading your stories…
          </p>
        )}

        {!loadingStories && stories.length === 0 && (
          <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
            You have no stories yet.{" "}
            <Link href="/stories/new" className="btn-inline">
              Create a story
            </Link>{" "}
            first, then link it here.
          </p>
        )}

        {!loadingStories && stories.length > 0 && (
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
                {selectedCategories.length > 0 ? "Suggested stories" : "Stories"}
              </span>
              <span style={{ fontSize: 13, color: "var(--text-hint)" }}>
                {selectedStoryIds.size} selected
              </span>
            </div>
            <p className="field-hint" style={{ marginBottom: 10 }}>
              {selectedCategories.length === 0
                ? "No categories selected yet — all your stories are shown. Add categories above to filter this list."
                : "Only stories that match at least one selected category appear here (or stories you have checked below before saving)."}
            </p>

            {selectedCategories.length > 0 && suggestedStories.length === 0 && (
              <p className="text-muted text-14" style={{ marginBottom: 10 }}>
                No stories use these categories yet. Tag your stories with matching categories, or
                clear categories above to see all stories.
              </p>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }} role="list">
              {suggestedStories.map((s) => (
                <ManageStoryLinkRow
                  key={s.id}
                  story={s}
                  selectedCategories={selectedCategories}
                  isSelected={selectedStoryIds.has(s.id)}
                  isExpanded={expandedStoryIds.has(s.id)}
                  onToggleLink={() => toggleStory(s.id)}
                  onToggleExpand={() => toggleStoryExpanded(s.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="error-banner show" role="alert" style={{ marginBottom: 12 }}>
          Error: {error}
        </div>
      )}

      <div className="edit-actions-bar">
        <div className="edit-actions-bar-inner">
          <div className="btn-group">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </button>
            <button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>
              Cancel
            </button>
          </div>
          <span className="edit-actions-bar-hint">{selectedStoryIds.size} linked</span>
        </div>
      </div>
    </form>
  );
}

function ManageStoryLinkRow({
  story: s,
  selectedCategories,
  isSelected,
  isExpanded,
  onToggleLink,
  onToggleExpand,
}: {
  story: Story;
  selectedCategories: string[];
  isSelected: boolean;
  isExpanded: boolean;
  onToggleLink: () => void;
  onToggleExpand: () => void;
}) {
  const highlightCategories = selectedCategories.length > 0 ? selectedCategories : [];
  const orderedCats = orderedStoryCategories(s.categories, highlightCategories);
  const showMatchHighlight = highlightCategories.length > 0;

  return (
    <div
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
          onClick={onToggleLink}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onToggleLink();
            }
          }}
          role="checkbox"
          aria-checked={isSelected}
          aria-label={isSelected ? `Unlink "${s.title}"` : `Link "${s.title}"`}
          tabIndex={0}
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
              onClick={onToggleExpand}
              aria-expanded={isExpanded}
              className="rc-expand-btn"
              aria-label={isExpanded ? "Collapse details" : "Expand details"}
            >
              <span aria-hidden>{isExpanded ? "▼" : "▶"}</span>
            </button>
          </div>

          <div className="chips-row" style={{ marginTop: 6, marginBottom: 0 }}>
            {isExpanded ? (
              <>
                {orderedCats.map((c) => (
                  <span
                    key={c}
                    className={`tag${showMatchHighlight && highlightCategories.includes(c) ? " tag-match" : ""}`}
                  >
                    {c}
                  </span>
                ))}
              </>
            ) : (
              <>
                {orderedCats.slice(0, MAX_CATEGORY_TAGS_ON_ROW).map((c) => (
                  <span
                    key={c}
                    className={`tag${showMatchHighlight && highlightCategories.includes(c) ? " tag-match" : ""}`}
                  >
                    {c}
                  </span>
                ))}
                {orderedCats.length > MAX_CATEGORY_TAGS_ON_ROW && (
                  <span
                    className="tag tag-more"
                    aria-label={`${orderedCats.length - MAX_CATEGORY_TAGS_ON_ROW} more categories`}
                  >
                    +{orderedCats.length - MAX_CATEGORY_TAGS_ON_ROW}
                  </span>
                )}
              </>
            )}
          </div>

          {isExpanded && (
            <div className="saved-question-edit__story-detail" style={{ marginTop: 10 }}>
              <div className="saved-question-edit__story-star">
                <div className="saved-question-edit__story-star-label">Situation</div>
                <div className="saved-question-edit__story-star-text">
                  {s.situation?.trim() ? s.situation : "No situation written yet."}
                </div>
              </div>
              <div className="saved-question-edit__story-star">
                <div className="saved-question-edit__story-star-label">Action</div>
                <div className="saved-question-edit__story-star-text">
                  {s.action?.trim() ? s.action : "No action written yet."}
                </div>
              </div>
              <div className="saved-question-edit__story-star">
                <div className="saved-question-edit__story-star-label">Result</div>
                <div className="saved-question-edit__story-star-text">
                  {s.result?.trim() ? s.result : "No result written yet."}
                </div>
              </div>

              <div
                className="saved-question-edit__story-detail-foot saved-question-edit__story-detail-foot--link-only"
                onClick={(e) => e.stopPropagation()}
              >
                <Link href={`/stories/${s.id}`} className="btn-inline" style={{ fontSize: 12 }}>
                  View story →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
