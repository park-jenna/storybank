"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { fetchStories, Story } from "@/lib/stories";
import { CATEGORIES } from "@/constants/categories";
import { StarCompletionVisual } from "@/components/StarCompletionVisual";
import { EmptyStateGlyph } from "@/components/EmptyStateGlyph";
import { getSessionToken, redirectToLogin } from "@/lib/session";
import { Chip } from "@/components/ui";

const ALL = "All" as const;
const CATEGORY_QUERY = "category";
const COMPLETE_QUERY = "complete";

function categoryFromSearchParams(searchParams: URLSearchParams): string {
  const raw = searchParams.get(CATEGORY_QUERY);
  if (!raw) return ALL;
  if (raw === ALL || (CATEGORIES as readonly string[]).includes(raw)) return raw;
  return ALL;
}

function isStoryStarComplete(s: Story): boolean {
  return (
    !!s.situation?.trim() &&
    !!s.action?.trim() &&
    !!s.result?.trim()
  );
}

export default function StoriesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inProgressOpen, setInProgressOpen] = useState(false);
  const inProgressSectionRef = useRef<HTMLElement>(null);

  const selectedCategory = useMemo(
    () => categoryFromSearchParams(searchParams),
    [searchParams]
  );
  const completeOnly = searchParams.get(COMPLETE_QUERY) === "1";

  useEffect(() => {
    const raw = searchParams.get(CATEGORY_QUERY);
    if (!raw) return;
    const validCategory = (CATEGORIES as readonly string[]).includes(raw);
    const shouldStrip = raw === ALL || !validCategory;
    if (shouldStrip) {
      const next = new URLSearchParams(searchParams.toString());
      next.delete(CATEGORY_QUERY);
      const q = next.toString();
      router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
    }
  }, [searchParams, pathname, router]);

  useEffect(() => {
    const raw = searchParams.get(COMPLETE_QUERY);
    if (raw === null) return;
    if (raw !== "1") {
      const next = new URLSearchParams(searchParams.toString());
      next.delete(COMPLETE_QUERY);
      const q = next.toString();
      router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
    }
  }, [searchParams, pathname, router]);

  const handleSelectCategory = useCallback(
    (cat: string) => {
      const next = new URLSearchParams(searchParams.toString());
      if (cat === ALL) {
        next.delete(CATEGORY_QUERY);
      } else {
        next.set(CATEGORY_QUERY, cat);
      }
      const q = next.toString();
      router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const toggleCompleteOnly = useCallback(() => {
    const next = new URLSearchParams(searchParams.toString());
    if (completeOnly) {
      next.delete(COMPLETE_QUERY);
    } else {
      next.set(COMPLETE_QUERY, "1");
    }
    const q = next.toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  }, [completeOnly, pathname, router, searchParams]);

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
        .filter((s) => !isStoryStarComplete(s))
        .sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
        ),
    [stories]
  );

  const completeCount = useMemo(
    () => stories.filter((s) => isStoryStarComplete(s)).length,
    [stories]
  );

  const filteredStories = useMemo(() => {
    let list = stories;
    if (selectedCategory !== ALL) {
      list = list.filter((s) =>
        (s.categories ?? []).includes(selectedCategory)
      );
    }
    if (completeOnly) {
      list = list.filter((s) => isStoryStarComplete(s));
    }
    return list;
  }, [stories, selectedCategory, completeOnly]);

  const hasAnyStories = stories.length > 0;
  const filtersActive =
    selectedCategory !== ALL || completeOnly;
  const hasFilteredResults = filteredStories.length > 0;

  return (
    <main className="main-content">
      <div className="page-shell page-shell--wide stories-page">
        {loading && (
          <div aria-hidden="true" aria-busy="true">
            <div className="page-header" aria-hidden>
              <div>
                <div className="skeleton skeleton-line--title" />
                <div className="skeleton skeleton-line--subtitle" />
              </div>
            </div>
            <div className="story-grid-2">
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
          <Fragment>
            <header className="page-header">
              <div className="page-header-left">
                <p className="stories-page-eyebrow">Story library</p>
                <h1 className="page-title">My Stories</h1>
                <p className="page-subtitle">
                  {hasAnyStories ? (
                    <>
                      {stories.length} saved
                      {completeCount > 0 && (
                        <>
                          {" · "}
                          {completeCount} STAR-complete
                        </>
                      )}
                      {inProgressStories.length > 0 && (
                        <>
                          {" · "}
                          {inProgressStories.length} in progress
                        </>
                      )}
                    </>
                  ) : (
                    "Open any STAR story to view or continue editing."
                  )}
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
                className="stories-in-progress-queue card"
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
                    <div className="stories-in-progress-queue-heading-row">
                      <h2
                        id="stories-in-progress-heading"
                        className="stories-in-progress-queue-title"
                      >
                        Pick up where you left off
                      </h2>
                      <span
                        className="stories-in-progress-queue-count"
                        aria-label={`${inProgressStories.length} stories in progress`}
                      >
                        {inProgressStories.length}
                      </span>
                    </div>
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
              <div className="stories-page-filters-wrap">
                <div className="stories-filters-bar">
                  <div
                    className="chips-row chips-row--section stories-filters-bar__chips"
                    role="group"
                    aria-label="Filter stories by category"
                  >
                    {[ALL, ...CATEGORIES].map((cat) => {
                      const selected = selectedCategory === cat;
                      return (
                        <Chip
                          key={cat}
                          selected={selected}
                          onClick={() => handleSelectCategory(cat)}
                        >
                          {cat}
                        </Chip>
                      );
                    })}
                  </div>
                  <div className="stories-filter-toggle">
                    <span
                      className="stories-filter-toggle__label"
                      id="stories-star-complete-label"
                    >
                      STAR complete only
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={completeOnly}
                      aria-labelledby="stories-star-complete-label"
                      className={`stories-filter-toggle__switch${completeOnly ? " stories-filter-toggle__switch--on" : ""}`}
                      onClick={toggleCompleteOnly}
                    >
                      <span className="visually-hidden">
                        {completeOnly ? "On" : "Off"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!hasAnyStories && (
              <div className="empty-state stories-page-empty">
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
              <div className="stories-page-library stories-page-library-panel card">
                <div className="card-head stories-library-head">
                  <h2 id="stories-library-heading" className="card-title">
                    Your stories
                  </h2>
                  <p className="stories-page-results" aria-live="polite">
                    {filtersActive
                      ? filteredStories.length === 1
                        ? "1 story matches"
                        : `${filteredStories.length} stories match`
                      : stories.length === 1
                        ? "1 story"
                        : `${stories.length} stories`}
                    {filtersActive && stories.length > 0 && (
                      <span className="stories-page-results-total">
                        {" "}
                        ({stories.length} total)
                      </span>
                    )}
                  </p>
                </div>

                {!hasFilteredResults ? (
                  <div className="empty-state stories-filter-empty" role="status">
                    <p className="empty-state-desc stories-filter-empty__text">
                      No stories match these filters. Try another category or
                      turn off &quot;STAR complete only&quot;.
                    </p>
                    <button
                      type="button"
                      className="btn-inline"
                      onClick={() => router.replace(pathname, { scroll: false })}
                    >
                      Clear filters
                    </button>
                  </div>
                ) : (
                  <section
                    className="stories-page-library-grid"
                    aria-labelledby="stories-library-heading"
                  >
                    <div className="story-grid-2">
                      {filteredStories.map((s) => {
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
              </div>
            )}
          </Fragment>
        )}
      </div>
    </main>
  );
}
