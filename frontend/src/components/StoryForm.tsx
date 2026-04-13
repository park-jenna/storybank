"use client";

import { useEffect, useState } from "react";

import { CATEGORIES } from "@/constants/categories";
import { StarWritingTips } from "@/components/StarWritingTips";

export type StoryFormValues = {
  title: string;
  categories: string[];
  situation: string;
  action: string;
  result: string;
};

type StoryFormProps = {
  initialValues?: Partial<StoryFormValues>;
  submitLabel: string;
  submittingLabel?: string;
  submitting: boolean;
  externalError?: string | null;
  errorPrefix?: string;
  footerHint?: string;
  onCancel: () => void;
  onDirtyChange?: (dirty: boolean) => void;
  onSubmit: (values: StoryFormValues) => Promise<void> | void;
};

const EMPTY_VALUES: StoryFormValues = {
  title: "",
  categories: [],
  situation: "",
  action: "",
  result: "",
};

function normalizeInitialValues(
  initialValues?: Partial<StoryFormValues>
): StoryFormValues {
  return {
    ...EMPTY_VALUES,
    ...initialValues,
    categories: initialValues?.categories ?? [],
  };
}

function isDirty(values: StoryFormValues): boolean {
  return (
    values.title.trim().length > 0 ||
    values.categories.length > 0 ||
    values.situation.trim().length > 0 ||
    values.action.trim().length > 0 ||
    values.result.trim().length > 0
  );
}

export function StoryForm({
  initialValues,
  submitLabel,
  submittingLabel = "Saving...",
  submitting,
  externalError,
  errorPrefix = "",
  footerHint,
  onCancel,
  onDirtyChange,
  onSubmit,
}: StoryFormProps) {
  const [values, setValues] = useState<StoryFormValues>(() =>
    normalizeInitialValues(initialValues)
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    onDirtyChange?.(isDirty(values));
  }, [onDirtyChange, values]);

  function setField<K extends keyof StoryFormValues>(
    field: K,
    value: StoryFormValues[K]
  ) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  function toggleCategory(category: string) {
    setValues((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setValidationError(null);

    const nextValues = {
      ...values,
      title: values.title.trim(),
      situation: values.situation.trim(),
      action: values.action.trim(),
      result: values.result.trim(),
    };

    if (!nextValues.title) {
      setValidationError("Title is required.");
      return;
    }
    if (nextValues.categories.length === 0) {
      setValidationError("At least one category is required.");
      return;
    }

    await onSubmit(nextValues);
  }

  const shownError = validationError ?? externalError;

  return (
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
              value={values.title}
              onChange={(e) => setField("title", e.target.value)}
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
            <div className="chips-row" role="group" aria-label="Story categories">
              {CATEGORIES.map((category) => {
                const selected = values.categories.includes(category);
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

          <div className="star-section-title">✦ STAR breakdown</div>

          <div className="star-field">
            <div className="star-field-label">Situation &amp; Task</div>
            <div className="star-field-sublabel">Context &amp; goal</div>
            <textarea
              className="textarea"
              value={values.situation}
              onChange={(e) => setField("situation", e.target.value)}
              placeholder="What was the context? What was your goal or role?"
              rows={3}
            />
          </div>

          <div className="star-field">
            <div className="star-field-label">Action</div>
            <div className="star-field-sublabel">What you did</div>
            <textarea
              className="textarea"
              value={values.action}
              onChange={(e) => setField("action", e.target.value)}
              placeholder="What did you do? Describe concrete steps."
              rows={3}
            />
          </div>

          <div className="star-field">
            <div className="star-field-label">Result</div>
            <div className="star-field-sublabel">Impact &amp; learning</div>
            <textarea
              className="textarea"
              value={values.result}
              onChange={(e) => setField("result", e.target.value)}
              placeholder="What was the outcome? What did you learn?"
              rows={3}
            />
          </div>

          {shownError && (
            <div
              className="error-banner show"
              role="alert"
              style={{ marginBottom: 12 }}
            >
              {errorPrefix}
              {shownError}
            </div>
          )}

          <div
            style={{
              marginTop: "1.25rem",
              paddingTop: "1.25rem",
              borderTop: "0.5px solid var(--border-card)",
            }}
          >
            <div className="btn-group" style={footerHint ? { marginBottom: 10 } : undefined}>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? submittingLabel : submitLabel}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={onCancel}
                disabled={submitting}
              >
                Cancel
              </button>
            </div>
            {footerHint && <p className="field-hint">{footerHint}</p>}
          </div>
        </div>
      </form>

      <StarWritingTips />
    </div>
  );
}
