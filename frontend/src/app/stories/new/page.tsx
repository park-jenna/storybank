"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createStory } from "@/lib/stories";
import { getSessionToken, redirectToLogin } from "@/lib/session";
import { StoryForm, type StoryFormValues } from "@/components/StoryForm";

export default function NewStoryPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [leaveConfirmHref, setLeaveConfirmHref] = useState<string | null>(null);

  const skipLeaveGuardRef = useRef(false);

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
    const token = getSessionToken();
    if (!token) {
      redirectToLogin(router, "/stories/new");
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

  async function handleSubmit(values: StoryFormValues) {
    setError(null);
    setLoading(true);

    try {
      const token = getSessionToken();
      if (!token) {
        throw new Error("No token found. Please log in again.");
      }

      await createStory(token, {
        title: values.title,
        categories: values.categories,
        situation: values.situation,
        action: values.action,
        result: values.result,
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

      <StoryForm
        submitLabel="Create Story"
        submitting={loading}
        externalError={error}
        footerHint="After creating the story, you can edit and refine it from the dashboard."
        onCancel={() => requestNavigate("/stories")}
        onDirtyChange={setIsDirty}
        onSubmit={handleSubmit}
      />

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
