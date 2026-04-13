"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { fetchStories, Story } from "@/lib/stories";
import { StarCompletionVisual } from "@/components/StarCompletionVisual";
import { EmptyStateGlyph } from "@/components/EmptyStateGlyph";

function storyProgress(s: Story): number {
  let n = 0;
  if (s.situation?.trim()) n++;
  if (s.action?.trim()) n++;
  if (s.result?.trim()) n++;
  return Math.round((n / 3) * 100);
}

export default function StoriesPage() {
  const router = useRouter();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inProgressOpen, setInProgressOpen] = useState(false);
  const inProgressSectionRef = useRef<HTMLElement>(null);

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
        const data = await fetchStories(token);
        setStories(data.stories);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Failed to load stories.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  const inProgressStories = useMemo(
    () =>
      [...stories]
        .filter((s) => storyProgress(s) < 100)
        .sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
        ),
    [stories]
  );

  const hasAnyStories = stories.length > 0;

  return (
    <main className="main-content">
      <div className="page-shell page-shell--wide">
        {loading && (
          <div aria-hidden="true" aria-busy="true">
            <div
              className="page-header"
              style={{ marginBottom: "var(--space-6)" }}
              aria-hidden
            >
              <div>
                <div className="skeleton skeleton-line--title" />
                <div className="skeleton skeleton-line--subtitle" />
              </div>
            </div>
            <div className="story-grid-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton skeleton-line skeleton-line--w75-h16" />
                  <div className="skeleton skeleton-line" />
                  <div className="skeleton skeleton-line" />
                  <div className="skeleton skeleton-line skeleton-line--w50-top" />
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="error-banner show mt-5" role="alert">
            Error: {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <header className="page-header">
              <div className="page-header-left">
                <h1 className="page-title">My Stories</h1>
                <p className="page-subtitle">
                  Open any STAR story to view or continue editing.
                </p>
              </div>
              <div className="page-header-actions">
                <Link href="/stories/new" className="btn-primary">
                  + New story
                </Link>
              </div>
            </header>

            {inProgressStories.length > 0 && (
              <section
                ref={inProgressSectionRef}
                className="stories-in-progress-queue card mb-5"
                aria-labelledby="stories-in-progress-heading"
              >
                <button
                  type="button"
                  className="stories-in-progress-queue-toggle"
                  id="stories-in-progress-trigger"
                  aria-expanded={inProgressOpen}
                  aria-controls="stories-in-progress-panel"
                  onClick={() => setInProgressOpen((v) => !v)}
                >
                  <span className="stories-in-progress-queue-toggle-text">
                    <p className="dashboard-onboarding-eyebrow">In progress</p>
                    <h2
                      id="stories-in-progress-heading"
                      className="stories-in-progress-queue-title"
                    >
                      Pick up where you left off
                    </h2>
                  </span>
                  <span
                    className={`about-feature-chevron${inProgressOpen ? " about-feature-chevron-open" : ""}`}
                    aria-hidden
                  >
                    <svg viewBox="0 0 12 12" width={12} height={12}>
                      <path
                        d="M3 4.5L6 7.5L9 4.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </button>
                <div
                  id="stories-in-progress-panel"
                  className="stories-in-progress-queue-panel"
                  role="region"
                  aria-labelledby="stories-in-progress-heading"
                  hidden={!inProgressOpen}
                >
                  <div className="carousel-wrap">
                    <div className="carousel">
                      {inProgressStories.map((s) => {
                        const situation = !!s.situation?.trim();
                        const action = !!s.action?.trim();
                        const result = !!s.result?.trim();
                        return (
                          <div
                            key={s.id}
                            className="carousel-card"
                            onClick={() =>
                              router.push(
                                `/stories/${s.id}?returnTo=${encodeURIComponent("/stories")}`
                              )
                            }
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                router.push(
                                  `/stories/${s.id}?returnTo=${encodeURIComponent("/stories")}`
                                );
                              }
                            }}
                          >
                            <div className="story-card-top">
                              <div className="story-card-title">{s.title}</div>
                            </div>
                            <div
                              className={`story-card-situation${situation ? "" : " empty"}`}
                            >
                              {s.situation || "No situation written yet."}
                            </div>
                            <div className="carousel-card-footer carousel-card-footer--solo">
                              <div className="carousel-card-footer-actions">
                                <StarCompletionVisual
                                  variant="card"
                                  situation={situation}
                                  action={action}
                                  result={result}
                                />
                                <button
                                  type="button"
                                  className="btn-row btn-row-sm carousel-card-footer-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(
                                      `/stories/${s.id}/edit?from=${encodeURIComponent(
                                        "/stories"
                                      )}`
                                    );
                                  }}
                                >
                                  {!situation && !action && !result
                                    ? "Start"
                                    : "Edit"}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {hasAnyStories && (
              <div className="card-head stories-library-head">
                <h2 id="stories-library-heading" className="card-title">
                  Your stories
                </h2>
                <p className="stories-page-results" aria-live="polite">
                  {stories.length === 1
                    ? "1 story"
                    : `${stories.length} stories`}
                </p>
              </div>
            )}

            {!hasAnyStories && (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <EmptyStateGlyph kind="document" />
                </div>
                <h3 className="empty-state-title">No stories yet</h3>
                <p className="empty-state-desc">
                  Create your first STAR story to get started.
                </p>
                <Link href="/stories/new" className="btn-primary">
                  + New story
                </Link>
              </div>
            )}

            {hasAnyStories && (
              <section
                className="stories-page-library-grid"
                aria-labelledby="stories-library-heading"
              >
                <div className="story-grid-3">
                  {stories.map((s) => {
                    const situation = !!s.situation?.trim();
                    const action = !!s.action?.trim();
                    const result = !!s.result?.trim();
                    return (
                      <Link
                        key={s.id}
                        href={`/stories/${s.id}`}
                        className="link-unstyled story-grid-card-link"
                      >
                        <article className="story-card">
                          <div className="story-card-top">
                            <div className="story-card-title">{s.title}</div>
                          </div>
                          <div
                            className={`story-card-situation${!s.situation ? " empty" : ""}`}
                          >
                            {s.situation || "No situation written yet."}
                          </div>
                          <StarCompletionVisual
                            variant="card"
                            situation={situation}
                            action={action}
                            result={result}
                          />
                        </article>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
