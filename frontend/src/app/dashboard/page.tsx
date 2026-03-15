// Dashboard - Overview, in-progress stories, quick links
// Design: visual hierarchy, consistency, scannability, accessibility

"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchStories, Story } from "@/lib/stories";
import { fetchUserQuestions, UserQuestionItem } from "@/lib/user-questions";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getChartColor } from "@/constants/categories";
import {
  Badge,
  Button,
  Card,
  EmptyState,
} from "@/components/ui";

function storyProgress(s: Story): number {
  let n = 0;
  if (s.situation?.trim()) n++;
  if (s.action?.trim()) n++;
  if (s.result?.trim()) n++;
  return Math.round((n / 3) * 100);
}

function isCompleted(s: Story): boolean {
  return storyProgress(s) === 100;
}

function SeeAllLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Link href={href} className="dashboard-see-all" aria-label={`${label}, open list`}>
      {label}
      <span className="dashboard-see-all-arrow" aria-hidden>→</span>
    </Link>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [stories, setStories] = useState<Story[]>([]);
  const [userQuestions, setUserQuestions] = useState<UserQuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        const [storiesRes, uqRes] = await Promise.all([
          fetchStories(token),
          fetchUserQuestions(token),
        ]);
        setStories(storiesRes.stories);
        setUserQuestions(uqRes.userQuestions);
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

  const hasAnyStories = stories.length > 0;

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of stories) {
      for (const cat of s.categories) {
        counts[cat] = (counts[cat] ?? 0) + 1;
      }
    }
    return counts;
  }, [stories]);

  const categorySegments = useMemo(() => {
    const total = Object.values(categoryCounts).reduce((a, b) => a + b, 0);
    if (total === 0) return [];
    const entries = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
    let acc = 0;
    return entries.map(([name, count]) => {
      const pct = (count / total) * 100;
      const start = acc;
      acc += pct;
      return {
        name,
        count,
        start,
        end: acc,
        pct,
        color: getChartColor(name),
      };
    });
  }, [categoryCounts]);

  const topCategories = useMemo(
    () =>
      Object.entries(categoryCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name]) => name),
    [categoryCounts]
  );

  const questionsWithoutStory = useMemo(
    () => userQuestions.filter((uq) => uq.stories.length === 0),
    [userQuestions]
  );

  const completedCount = useMemo(
    () => stories.filter(isCompleted).length,
    [stories]
  );

  const inProgressStories = useMemo(
    () =>
      [...stories]
        .filter((s) => storyProgress(s) < 100)
        .sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
        )
        .slice(0, 6),
    [stories]
  );

  const recentRowStories = useMemo(
    () =>
      inProgressStories.length > 0
        ? inProgressStories
        : [...stories]
            .sort(
              (a, b) =>
                new Date(b.createdAt || 0).getTime() -
                new Date(a.createdAt || 0).getTime()
            )
            .slice(0, 6),
    [stories, inProgressStories]
  );

  const gradientClass = (i: number) => {
    const classes = ["gradient-1", "gradient-2", "gradient-3"];
    return classes[i % 3];
  };

  return (
    <main className="dashboard-page" role="main" aria-label="Dashboard overview">
      <div className="dashboard-container">
        <header className="dashboard-header">
          <h1 className="dashboard-title">Overview</h1>
          <p className="dashboard-subtitle">
            Your STAR stories at a glance
          </p>
        </header>

        {loading && (
          <div className="dashboard-loading" aria-live="polite" aria-busy="true">
            <div className="dashboard-loading-spinner" aria-hidden />
            <p className="dashboard-loading-text muted">Loading stories...</p>
          </div>
        )}

        {!loading && !error && hasAnyStories && (
          <>
            <section
              className="dashboard-grid-top"
              aria-labelledby="dashboard-stats-heading"
            >
              <Card
                variant="overview"
                className="dashboard-card"
              >
                <div className="overview-card-inner">
                  <div className="dashboard-card-title-row">
                    <h2
                      id="dashboard-stats-heading"
                      className="dashboard-card-title"
                    >
                      Your stories
                    </h2>
                    <SeeAllLink href="/stories" label="See all" />
                  </div>
                  <div className="overview-stats-wrap">
                    <div className="overview-stats-grid">
                      <div className="overview-stat overview-stat-primary">
                        <span className="overview-stat-value" aria-label={`${stories.length} total stories`}>
                          {stories.length}
                        </span>
                        <span className="overview-stat-label muted">Total stories</span>
                      </div>
                      <div className="overview-stat">
                        <span className="overview-stat-value">{completedCount}</span>
                        <span className="overview-stat-label muted">Completed</span>
                      </div>
                      <div className="overview-stat">
                        <span className="overview-stat-value">
                          {stories.length - completedCount}
                        </span>
                        <span className="overview-stat-label muted">In progress</span>
                      </div>
                      <div className="overview-stat">
                        <span className="overview-stat-value">
                          {Object.keys(categoryCounts).length}
                        </span>
                        <span className="overview-stat-label muted">Categories</span>
                      </div>
                    </div>
                  </div>
                  <div className="overview-top-section">
                    <span className="overview-top-label muted">Top categories</span>
                    {topCategories.length > 0 ? (
                      <div className="overview-chips">
                        {topCategories.map((cat) => (
                          <span
                            key={cat}
                            className="overview-chip"
                            style={{ "--chip-color": getChartColor(cat) } as React.CSSProperties}
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="overview-top-empty muted">Tag your stories with categories to see them here.</p>
                    )}
                  </div>
                  <Link href="/stories/new" className="overview-cta-link">
                    <span className="overview-cta-icon" aria-hidden>+</span>
                    New story
                  </Link>
                </div>
              </Card>

                <Card className="dashboard-card dashboard-card-category">
                <div className="dashboard-card-title-row">
                  <h2 className="dashboard-card-title">By category</h2>
                  <SeeAllLink href="/stories" label="See all" />
                </div>
              <div className="dashboard-category-list">
                {categorySegments.length > 0 ? (
                  categorySegments.slice(0, 5).map((seg) => (
                    <Link
                      key={seg.name}
                      href={`/stories?category=${encodeURIComponent(seg.name)}`}
                      className="dashboard-category-row"
                      style={{ "--cat-color": seg.color } as React.CSSProperties}
                    >
                      <span className="dashboard-category-dot" aria-hidden />
                      <span className="dashboard-category-name truncate">
                        {seg.name}
                      </span>
                      <span className="dashboard-category-count muted">
                        {seg.count} {seg.count === 1 ? "story" : "stories"}
                      </span>
                      <span className="dashboard-category-arrow" aria-hidden>→</span>
                    </Link>
                  ))
                ) : (
                  <p className="dashboard-category-empty muted">
                    Tag your stories with categories to see them here.
                  </p>
                )}
                </div>
              </Card>
            </section>

            {recentRowStories.length > 0 && (
              <section
                className="dashboard-section page-section"
                aria-labelledby="dashboard-recent-heading"
              >
                <div className="dashboard-section-header">
                  <div>
                    <h2 id="dashboard-recent-heading" className="dashboard-section-title">
                      {inProgressStories.length > 0
                        ? "In progress"
                        : "Recent stories"}
                    </h2>
                    <p className="dashboard-section-intro muted">
                      {inProgressStories.length > 0
                        ? "Stories with S, A, or R sections left to complete."
                        : "Your latest STAR stories."}
                    </p>
                  </div>
                  <SeeAllLink href="/stories" label="See all" />
                </div>
                <div className="dashboard-carousel-fade-wrap">
                  <div className="dashboard-upcoming-row dashboard-carousel" role="list">
                    {recentRowStories.map((s, i) => {
                  const hasS = !!s.situation?.trim();
                  const hasA = !!s.action?.trim();
                  const hasR = !!s.result?.trim();
                  const progress = storyProgress(s);
                  const daysAgo =
                    s.createdAt &&
                    Math.floor(
                      (Date.now() - new Date(s.createdAt).getTime()) /
                        (1000 * 60 * 60 * 24)
                    );
                  return (
                    <Link
                      key={s.id}
                      href={`/stories/${s.id}/edit`}
                      className={`dashboard-upcoming-card ${gradientClass(i)}`}
                      role="listitem"
                    >
                      <span className="dashboard-card-meta muted">
                        {daysAgo !== undefined
                          ? `${daysAgo} day${daysAgo !== 1 ? "s" : ""} ago`
                          : "Recently"}
                      </span>
                      <h3 className="dashboard-card-story-title">
                        {s.title}
                      </h3>
                      <div className="star-completion" aria-label={`STAR completion ${progress}%`}>
                        <span className="star-completion-label muted">STAR</span>
                        <div className="star-completion-bars">
                          {[
                            { letter: "S", filled: hasS },
                            { letter: "A", filled: hasA },
                            { letter: "R", filled: hasR },
                          ].map(({ letter, filled }) => (
                            <div key={letter} className="star-completion-segment">
                              <span className="star-completion-letter muted">
                                {letter}
                              </span>
                              <div
                                className={`star-completion-bar ${filled ? "star-completion-bar--filled" : ""}`}
                                aria-hidden
                              />
                            </div>
                          ))}
                        </div>
                        <span className="star-completion-pct muted" aria-hidden>
                          {progress}%
                        </span>
                      </div>
                    </Link>
                    );
                  })}
                  </div>
                  <div className="dashboard-carousel-fade-edge" aria-hidden />
                </div>
              </section>
            )}

            <section
              className="dashboard-section page-section dashboard-unlinked-questions"
              aria-labelledby="dashboard-questions-heading"
            >
              <div className="dashboard-section-header">
                <div>
                  <h2 id="dashboard-questions-heading" className="dashboard-section-title">
                    Questions without a story
                  </h2>
                  <p className="dashboard-section-intro muted">
                    {questionsWithoutStory.length > 0
                      ? "Link a STAR story to each question so you're ready when interviewers ask."
                      : userQuestions.length === 0
                        ? "Save questions from Common questions, then link stories in Saved Questions."
                        : "All saved questions have at least one story linked."}
                  </p>
                </div>
                <Link
                  href="/saved-questions"
                  className="dashboard-see-all"
                  aria-label="Open Saved Questions"
                >
                  Saved questions
                  <span className="dashboard-see-all-arrow" aria-hidden>→</span>
                </Link>
              </div>
              {questionsWithoutStory.length > 0 ? (
                <Card className="dashboard-questions-card">
                <ul className="dashboard-unlinked-list list-none p-0 m-0">
                  {questionsWithoutStory.slice(0, 5).map((uq) => (
                    <li key={uq.id}>
                      <Link
                        href="/saved-questions"
                        className="dashboard-unlinked-item"
                      >
                        <span className="dashboard-unlinked-question">
                          {uq.question.content}
                        </span>
                        {uq.question.recommendedCategories?.length > 0 && (
                          <div className="dashboard-unlinked-cats">
                            {uq.question.recommendedCategories
                              .slice(0, 3)
                              .map((cat) => (
                                <Badge
                                  key={cat}
                                  category={cat}
                                  className="!text-xs"
                                />
                              ))}
                          </div>
                        )}
                        <span className="dashboard-unlinked-hint muted">
                          Link a story →
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                </Card>
              ) : null}
            </section>
        </>
      )}

        {error && (
          <Card variant="error" className="dashboard-error-card" role="alert">
            <p className="form-error m-0">Error: {error}</p>
          </Card>
        )}

        {!loading && !error && !hasAnyStories && (
          <EmptyState
            icon="📝"
            title="No stories yet"
            description="Create your first STAR story to get started."
            action={
              <Button
                variant="primary"
                className="empty-state-cta"
                onClick={() => router.push("/stories/new")}
              >
                + New Story
              </Button>
            }
          />
        )}
      </div>
    </main>
  );
}
