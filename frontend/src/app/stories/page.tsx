"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { fetchStories, Story } from "@/lib/stories";
import { CATEGORIES } from "@/constants/categories";

const ALL = "All" as const;

function storyProgress(s: Story): number {
  let n = 0;
  if (s.situation?.trim()) n++;
  if (s.action?.trim()) n++;
  if (s.result?.trim()) n++;
  return Math.round((n / 3) * 100);
}

function StoriesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [internalCategory, setInternalCategory] = useState<string>(ALL);

  const categoryFromUrl = searchParams.get("category");
  const selectedCategory =
    categoryFromUrl != null && categoryFromUrl !== ""
      ? decodeURIComponent(categoryFromUrl)
      : internalCategory;

  function handleSelectCategory(cat: string) {
    setInternalCategory(cat);
    if (cat === ALL) {
      router.replace("/stories");
    } else {
      router.replace(`/stories?category=${encodeURIComponent(cat)}`);
    }
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

  const filteredStories = useMemo(() => {
    if (selectedCategory === ALL) return stories;
    return stories.filter((s) => s.categories.includes(selectedCategory));
  }, [stories, selectedCategory]);

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
  const hasFilteredStories = filteredStories.length > 0;
  const completeCount = stories.filter((s) => storyProgress(s) === 100).length;

  return (
    <main className="main-content">
      {loading && (
        <div className="loading-state">
          <p className="loading-message">Loading stories...</p>
        </div>
      )}

      {error && (
        <div className="error-banner show mt-5" role="alert">
          Error: {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="page-header">
            <div className="page-header-left">
              <h1 className="page-title">My Stories</h1>
              <p className="page-subtitle">
                {stories.length} stories - {completeCount} complete - {inProgressStories.length} in progress
              </p>
            </div>
            <div className="page-header-actions">
              <Link href="/stories/new" className="btn-primary">
                + New story
              </Link>
            </div>
          </div>

          {inProgressStories.length > 0 && (
            <div className="mb-5">
              <div className="section-label">IN PROGRESS</div>
              <div className="carousel-wrap">
                <button
                  type="button"
                  className="pagination-arrow carousel-arrow carousel-arrow-left"
                  aria-label="Previous in-progress stories"
                  disabled
                >
                  ‹
                </button>
                <div className="carousel">
                {inProgressStories.map((s) => {
                  const missing: string[] = [];
                  if (!s.situation?.trim()) missing.push("S/T");
                  if (!s.action?.trim()) missing.push("Action");
                  if (!s.result?.trim()) missing.push("Result");
                  return (
                    <div
                      key={s.id}
                      className="carousel-card"
                      onClick={() => router.push(`/stories/${s.id}/edit`)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          router.push(`/stories/${s.id}/edit`);
                        }
                      }}
                    >
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 500,
                          color: "var(--text-primary)",
                          marginBottom: 5,
                          lineHeight: 1.35,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {s.title}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--text-muted)",
                          marginBottom: 8,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          lineHeight: 1.4,
                        }}
                      >
                        {s.situation || (
                          <span style={{ color: "#C8B890", fontStyle: "italic" }}>
                            No situation written yet.
                          </span>
                        )}
                      </div>
                      {missing.length > 0 && (
                        <div className="story-card-missing">
                          <span className="tag-missing">
                            Missing {missing.join(" ")}
                          </span>
                        </div>
                      )}
                      <div
                        style={{
                          display: "flex",
                          gap: 4,
                          flexWrap: "wrap",
                          marginBottom: 8,
                        }}
                      >
                        {s.categories.map((c) => (
                          <span key={c} className="tag">
                            {c}
                          </span>
                        ))}
                      </div>
                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button
                          type="button"
                          className="btn-warn"
                          style={{ fontSize: 12, padding: "3px 9px" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/stories/${s.id}/edit`);
                          }}
                        >
                          {!s.situation && !s.action && !s.result ? "Start" : "Edit"}
                        </button>
                      </div>
                    </div>
                  );
                })}
                </div>
                <button
                  type="button"
                  className="pagination-arrow carousel-arrow carousel-arrow-right"
                  aria-label="Next in-progress stories"
                  disabled
                >
                  ›
                </button>
              </div>
            </div>
          )}

          <div className="chips-row" style={{ marginBottom: "0.5rem" }}>
            {[ALL, ...CATEGORIES].map((cat) => (
              <div
                key={cat}
                role="button"
                tabIndex={0}
                className={`chip${selectedCategory === cat ? " active" : ""}`}
                onClick={() => handleSelectCategory(cat)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSelectCategory(cat);
                  }
                }}
              >
                {cat}
              </div>
            ))}
          </div>
          {hasAnyStories && (
            <p
              className="filter-result-summary"
              style={{
                fontSize: 13,
                color: "var(--text-muted)",
                marginBottom: "1.25rem",
                marginTop: 0,
              }}
              aria-live="polite"
            >
              {selectedCategory === ALL
                ? `Showing all (${stories.length})`
                : `Showing ${filteredStories.length} in ${selectedCategory}`}
            </p>
          )}

          {!hasAnyStories && (
            <div className="empty-state">
              <div className="empty-state-icon">📝</div>
              <h3 className="empty-state-title">No stories yet</h3>
              <p className="empty-state-desc">
                Create your first STAR story to get started.
              </p>
              <Link href="/stories/new" className="btn-primary">
                + New story
              </Link>
            </div>
          )}

          {hasAnyStories && !hasFilteredStories && (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <h3 className="empty-state-title">No stories found</h3>
              <p className="empty-state-desc">
                No stories in the &quot;{selectedCategory}&quot; category.
              </p>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => handleSelectCategory(ALL)}
              >
                Show all stories
              </button>
            </div>
          )}

          {hasFilteredStories && (
            <div className="story-grid-3">
              {filteredStories.map((s) => {
                const isComplete = storyProgress(s) === 100;
                const missing: string[] = [];
                if (!s.situation?.trim()) missing.push("S/T");
                if (!s.action?.trim()) missing.push("Action");
                if (!s.result?.trim()) missing.push("Result");
                return (
                  <Link
                    key={s.id}
                    href={`/stories/${s.id}`}
                    style={{ textDecoration: "none" }}
                  >
                    <div className="story-card">
                      <div className="story-card-top">
                        <div className="story-card-title">{s.title}</div>
                        {isComplete && (
                          <span className="badge badge-done">Complete</span>
                        )}
                      </div>
                      <div
                        className={`story-card-situation${!s.situation ? " empty" : ""}`}
                      >
                        {s.situation || "No situation written yet."}
                      </div>
                      <div className="story-card-missing">
                        {missing.length > 0 && (
                          <span className="tag-missing">
                            Missing {missing.join(" ")}
                          </span>
                        )}
                      </div>
                      <div className="story-card-cats">
                        {s.categories.slice(0, 3).map((c) => (
                          <span key={c} className="tag">
                            {c}
                          </span>
                        ))}
                        {s.categories.length > 3 && (
                          <span className="tag">+{s.categories.length - 3}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </>
      )}
    </main>
  );
}

export default function StoriesPage() {
  return (
    <Suspense
      fallback={
        <main className="main-content">
          <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: "1.5rem" }}>
            Loading...
          </p>
        </main>
      }
    >
      <StoriesPageContent />
    </Suspense>
  );
}
