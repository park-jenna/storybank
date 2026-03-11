// Dashboard - MeetCraft-style layout: top card grid, upcoming row, then all stories

"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchStories, Story } from "@/lib/stories";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CATEGORIES, getBadgeClass, getChartColor } from "@/constants/categories";
import {
  Button,
  Card,
  Chip,
  Badge,
  EmptyState,
} from "@/components/ui";

function storyProgress(s: Story): number {
  let n = 0;
  if (s.situation?.trim()) n++;
  if (s.action?.trim()) n++;
  if (s.result?.trim()) n++;
  return Math.round((n / 3) * 100);
}

export default function DashboardPage() {
  const router = useRouter();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const ALL = "All" as const;
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL);

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
  }, []);

  const filteredStories = useMemo(() => {
    if (selectedCategory === ALL) return stories;
    return stories.filter((s) => s.categories.includes(selectedCategory));
  }, [stories, selectedCategory]);

  const hasAnyStories = stories.length > 0;
  const hasFilteredStories = filteredStories.length > 0;

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

  const recentStories = useMemo(
    () =>
      [...stories]
        .sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
        )
        .slice(0, 4),
    [stories]
  );

  const upcomingRowStories = useMemo(
    () =>
      [...stories]
        .sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
        )
        .slice(0, 6),
    [stories]
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const gradientClass = (i: number) => {
    const classes = ["gradient-1", "gradient-2", "gradient-3"];
    return classes[i % 3];
  };

  return (
    <main className="dashboard-page">
      {loading && (
        <p className="muted mt-6">Loading stories...</p>
      )}

      {!loading && !error && (
        <>
          {/* Top card grid - MeetCraft style */}
          <div className="dashboard-grid-top">
            {/* Overview card - wider, Top categories to the right of chart */}
            <Card variant="overview" className="dashboard-card dashboard-card-overview">
              <div className="overview-card-inner">
                <h2 className="dashboard-card-title">
                  Overview
                  <Link href="/dashboard" className="see-all text-[14px]">
                    See All
                  </Link>
                </h2>
                <div className="overview-chart-row">
                  <div className="relative w-[120px] h-[120px] shrink-0">
                    {categorySegments.length > 0 ? (
                      <div
                        className="absolute inset-0 w-[120px] h-[120px] rounded-full z-0"
                        style={{
                          background: `conic-gradient(${categorySegments
                            .map((s) => `${s.color} ${s.start}% ${s.end}%`)
                            .join(", ")})`,
                        }}
                        aria-hidden
                      />
                    ) : (
                      <div
                        className="absolute inset-0 w-[120px] h-[120px] rounded-full bg-[var(--border-light)] z-0"
                        aria-hidden
                      />
                    )}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[72px] h-[72px] rounded-full bg-[var(--card)] flex flex-col items-center justify-center shadow-[0_0_0_2px_var(--border-light)] z-[1]">
                      <span className="text-2xl font-extrabold leading-none text-[var(--foreground)]">
                        {stories.length}
                      </span>
                      <span className="muted text-xs mt-0.5">Stories</span>
                    </div>
                  </div>
                  <div className="flex gap-6 flex-wrap">
                    <div className="flex flex-col gap-1">
                      <span className="text-xl font-bold text-[var(--foreground)]">
                        {stories.length}
                      </span>
                      <span className="muted text-sm">Saved</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xl font-bold text-[var(--foreground)]">
                        {Object.keys(categoryCounts).length}
                      </span>
                      <span className="muted text-sm">Categories</span>
                    </div>
                  </div>
                </div>
                {topCategories.length > 0 && (
                  <div className="overview-top-section">
                    <span className="muted text-sm">Top:</span>
                    <div className="overview-chips">
                      {topCategories.map((cat) => (
                        <Chip
                          key={cat}
                          selected={selectedCategory === cat}
                          onClick={() => setSelectedCategory(cat)}
                        >
                          {cat}
                        </Chip>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Recent Stories list card */}
            <div className="dashboard-card">
              <h2 className="dashboard-card-title">
                Recent Stories
                <Link href="/dashboard" className="see-all text-[14px]">
                  See All
                </Link>
              </h2>
              <ul className="list-none p-0 m-0 space-y-2">
                {recentStories.slice(0, 3).map((s) => (
                  <li key={s.id}>
                    <Link
                      href={`/stories/${s.id}`}
                      className="no-underline text-inherit flex flex-col gap-0.5 py-2 px-0 rounded-lg hover:bg-[var(--border-light)]/50 transition-colors"
                    >
                      <span className="text-[var(--foreground)] font-medium text-sm line-clamp-1">
                        {s.title}
                      </span>
                      <span className="muted text-xs">
                        {s.createdAt ? formatDate(s.createdAt) : "Recently"}
                      </span>
                    </Link>
                  </li>
                ))}
                {recentStories.length === 0 && (
                  <li className="muted text-sm py-2">No stories yet.</li>
                )}
              </ul>
              <Link
                href="/stories/new"
                className="dashboard-add-story-link"
              >
                + New Story
              </Link>
            </div>

            {/* By category / Projects worked style */}
            <div className="dashboard-card">
              <h2 className="dashboard-card-title">
                By Category
                <Link href="/dashboard" className="see-all text-[14px]">
                  See All
                </Link>
              </h2>
              <div className="flex flex-col gap-2">
                {categorySegments.length > 0 ? (
                  categorySegments.slice(0, 4).map((seg) => (
                    <div
                      key={seg.name}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ background: seg.color }}
                        />
                        <span className="text-[var(--foreground)] truncate max-w-[120px]">
                          {seg.name}
                        </span>
                      </span>
                      <span className="muted font-medium">{seg.count}</span>
                    </div>
                  ))
                ) : (
                  <p className="muted text-sm">No categories yet.</p>
                )}
              </div>
            </div>

          </div>

          {/* Upcoming / Recent row - horizontal cards with progress */}
          {upcomingRowStories.length > 0 && (
            <section className="page-section">
              <h2 className="dashboard-section-title">
                Recent Stories
                <Link href="/dashboard" className="see-all text-[14px]">
                  See All
                </Link>
              </h2>
              <div className="dashboard-upcoming-row">
                {upcomingRowStories.map((s, i) => {
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
                      href={`/stories/${s.id}`}
                      className={`dashboard-upcoming-card ${gradientClass(i)}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs muted">
                          {daysAgo !== undefined ? `${daysAgo} days ago` : "Recently"}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-[var(--foreground)] m-0 mb-2 line-clamp-2">
                        {s.title}
                      </h3>
                      <div className="dashboard-progress-bar">
                        <div
                          className="dashboard-progress-fill"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-xs muted mt-2 mb-0">
                        Progress {progress}%
                      </p>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* All Stories section */}
          <section className="page-section">
            <h2 className="page-section-title">All Stories</h2>
            <div className="flex flex-wrap gap-3">
              {[ALL, ...CATEGORIES].map((cat) => (
                <Chip
                  key={cat}
                  selected={selectedCategory === cat}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </Chip>
              ))}
            </div>
            <p className="muted mt-4 mb-0 text-base">
              Showing{" "}
              <b>
                {selectedCategory === ALL
                  ? "all stories"
                  : `stories in "${selectedCategory}"`}
              </b>{" "}
              ({filteredStories.length})
            </p>
          </section>
        </>
      )}

      {error && (
        <Card variant="error" className="mt-[18px]">
          <p className="form-error m-0">Error: {error}</p>
        </Card>
      )}

      {!loading && !error && !hasAnyStories && (
        <EmptyState
          icon="📝"
          title="No stories yet"
          description="Create your first STAR story to get started"
          action={
            <Button
              variant="primary"
              className="mt-4"
              onClick={() => router.push("/stories/new")}
            >
              + New Story
            </Button>
          }
        />
      )}

      {!loading && !error && hasAnyStories && !hasFilteredStories && (
        <EmptyState
          icon="🔍"
          title="No stories found"
          description={`No stories in the "${selectedCategory}" category`}
          action={
            <Button className="mt-4" onClick={() => setSelectedCategory(ALL)}>
              Show All Stories
            </Button>
          }
        />
      )}

      {!loading && !error && hasFilteredStories && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-7">
          {filteredStories.map((s) => (
            <Link
              key={s.id}
              href={`/stories/${s.id}`}
              className="no-underline text-inherit block min-w-0"
            >
              <Card variant="story">
                <div className="flex justify-between items-start mb-1 shrink-0">
                  <span className="text-base muted">
                    {s.createdAt ? formatDate(s.createdAt) : "Recently"}
                  </span>
                  <Button
                    variant="menu"
                    className="p-1"
                    onClick={(e) => {
                      e.preventDefault();
                    }}
                  >
                    ⋯
                  </Button>
                </div>
                <h3 className="text-2xl font-bold leading-snug text-[var(--foreground)] m-0 shrink-0 overflow-hidden line-clamp-2">
                  {s.title}
                </h3>
                <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                  <p className="text-[var(--muted)] text-base leading-relaxed flex-1 min-w-0 overflow-hidden text-ellipsis line-clamp-3 m-0">
                    {s.result
                      ? `Summary: ${s.result}`
                      : s.situation
                        ? `Situation: ${s.situation}`
                        : "Click to view full story"}
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap shrink-0">
                  {s.categories.slice(0, 3).map((cat) => (
                    <Badge key={cat} category={cat} />
                  ))}
                  {s.categories.length > 3 && (
                    <span className="badge badge-primary">
                      +{s.categories.length - 3}
                    </span>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
