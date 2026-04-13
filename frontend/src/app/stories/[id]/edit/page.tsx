"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchStoryById, Story, updateStoryById } from "@/lib/stories";
import { useToast } from "@/contexts/ToastContext";
import { getSessionToken, redirectToLogin } from "@/lib/session";
import { StoryForm, type StoryFormValues } from "@/components/StoryForm";

type EditStoryPageProps = {
  params: Promise<{ id: string }>;
};

export default function EditStoryPage({ params }: EditStoryPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { id: storyId } = use(params);

  const [story, setStory] = useState<Story | null>(null);
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
        const token = getSessionToken();
        if (!token) {
          setError("No token found. Please log in again.");
          redirectToLogin(router);
          return;
        }
        if (!storyId) {
          setError("No story ID provided.");
          return;
        }
        const data = await fetchStoryById(token, storyId);
        setStory(data.story);
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

  const storyFormInitialValues = useMemo(
    () =>
      story
        ? {
            title: story.title ?? "",
            categories: story.categories ?? [],
            situation: story.situation ?? "",
            action: story.action ?? "",
            result: story.result ?? "",
          }
        : undefined,
    [story]
  );

  async function handleSave(values: StoryFormValues) {
    setError(null);
    setSaving(true);

    try {
      const token = getSessionToken();
      if (!token) throw new Error("No token found. Please log in again.");
      if (!storyId) throw new Error("No story ID provided.");

      await updateStoryById(token, storyId, {
        title: values.title,
        categories: values.categories,
        situation: values.situation,
        action: values.action,
        result: values.result,
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

      <StoryForm
        initialValues={storyFormInitialValues}
        submitLabel="Save Changes"
        submitting={saving}
        externalError={error}
        errorPrefix="Error: "
        onCancel={handleBack}
        onSubmit={handleSave}
      />
    </main>
  );
}
