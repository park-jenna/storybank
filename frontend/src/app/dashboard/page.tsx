// Dashboard — Welcome, stats, in-progress / completed stories, category coverage, saved questions

"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchStories, Story } from "@/lib/stories";
import { fetchUserQuestions, UserQuestionItem } from "@/lib/user-questions";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/constants/categories";

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

function getMissingLabel(s: Story): string {
  const hasS = !!s.situation?.trim();
  const hasA = !!s.action?.trim();
  const hasR = !!s.result?.trim();
  if (hasS && hasA && hasR) return "Complete";
  const missing: string[] = [];
  if (!hasS) missing.push("Situation");
  if (!hasA) missing.push("Action");
  if (!hasR) missing.push("Result");
  return missing.join(" · ") + " missing";
}

function getLinkedCount(storyId: string, userQuestions: UserQuestionItem[]): number {
  return userQuestions.filter((uq) =>
    uq.stories.some((s) => s.id === storyId)
  ).length;
}

function SeeAllLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="card-link" aria-label={`${label}, open list`}>
      {label}
      <span aria-hidden> →</span>
    </Link>
  );
}

const USER_NAME = "User"; // TODO: from auth when available
const CATEGORY_GOAL = 3;

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
  const completedStories = useMemo(
    () => stories.filter(isCompleted),
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
        ),
    [stories]
  );
  const completedCount = completedStories.length;
  const questionsWithoutStory = useMemo(
    () => userQuestions.filter((uq) => uq.stories.length === 0),
    [userQuestions]
  );
  const unlinkedCount = questionsWithoutStory.length;

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of CATEGORIES) {
      counts[c] = 0;
    }
    for (const s of stories) {
      for (const cat of s.categories) {
        if (cat in counts) counts[cat]++;
      }
    }
    return counts;
  }, [stories]);

  const categoryCoveredCount = useMemo(
    () => Object.values(categoryCounts).filter((n) => n > 0).length,
    [categoryCounts]
  );
  const missingCategory = useMemo(() => {
    const zero = CATEGORIES.find((c) => (categoryCounts[c] ?? 0) === 0);
    return zero ?? null;
  }, [categoryCounts]);

  const maxCategoryCount = useMemo(
    () => Math.max(...Object.values(categoryCounts), 1),
    [categoryCounts]
  );

  return (
    <main className="main-content" role="main" aria-label="Dashboard overview">
      {loading && (
        <div className="loading-state" aria-live="polite" aria-busy="true">
          <p className="loading-message">Loading stories...</p>
        </div>
      )}

      {error && (
        <div className="error-banner show" role="alert">
          Error: {error}
        </div>
      )}

      {!loading && !error && !hasAnyStories && (
        <div className="empty-state">
          <div className="empty-state-icon">📝</div>
          <h3 className="empty-state-title">No stories yet</h3>
          <p className="empty-state-desc">Create your first STAR story to get started.</p>
          <Link href="/stories/new" className="btn-primary">
            + New story
          </Link>
        </div>
      )}

        {!loading && !error && hasAnyStories && (
          <>
            {/* Page header: Welcome + subtitle + New story */}
            <header className="page-header">
              <div className="page-header-left">
                <h1 className="page-title">Welcome back</h1>
                <p className="page-subtitle">
                  {inProgressStories.length} stories in progress
                  {" · "}
                  {unlinkedCount} questions unlinked
                </p>
              </div>
              <Link href="/stories/new" className="btn-primary">
                + New story
              </Link>
            </header>

            {/* Stat cards row */}
            <div className="stats-row">
              <div className="stat-card">
                <div className="stat-label">Total stories</div>
                <div className="stat-value" aria-label={`${stories.length} total stories`}>
                  {stories.length}
                </div>
                <div className="stat-sub">written</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">STAR complete</div>
                <div className="stat-value">{completedCount}</div>
                <div className="stat-sub">
                  {inProgressStories.length} in progress
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Saved questions</div>
                <div className="stat-value">{userQuestions.length}</div>
                <div className="stat-sub">stories linked</div>
              </div>
              <div className={`stat-card${missingCategory ? " stat-card--warn" : ""}`}>
                <div className="stat-label">Category coverage</div>
                <div className={`stat-value ${missingCategory ? "warn" : ""}`}>
                  {categoryCoveredCount}/{CATEGORIES.length}
                </div>
                <div className={`stat-sub ${missingCategory ? "warn" : ""}`}>
                  {missingCategory
                    ? `${missingCategory} missing`
                    : "All covered"}
                </div>
              </div>
            </div>

            {/* Two columns: Stories (left) | Coverage & Saved questions (right) */}
            <div className="dashboard-grid">
              <div className="col-stack">
                {/* In progress card */}
                <div className="card">
                  <div className="card-head">
                    <h2 className="card-title">In progress</h2>
                    <SeeAllLink href="/stories" label="View all" />
                  </div>
                  {inProgressStories.slice(0, 5).map((s) => {
                    const progress = storyProgress(s);
                    const dotClass =
                      progress === 0
                        ? "dot-empty"
                        : progress === 100
                          ? "dot-done"
                          : "dot-partial";
                    const missingLabel = getMissingLabel(s);
                    const isNotStarted = progress === 0;
                    return (
                      <div key={s.id} className="story-row">
                        <div className={`dot ${dotClass}`} aria-hidden />
                        <div className="story-row-info">
                          <div className="story-row-title">{s.title}</div>
                          <div className={`story-row-meta${isNotStarted ? " text-warn" : ""}`}>
                            {isNotStarted ? "Not started" : missingLabel}
                          </div>
                        </div>
                        <Link
                          href={`/stories/${s.id}/edit`}
                          className={isNotStarted ? "btn-primary" : "btn-secondary"}
                        >
                          {isNotStarted ? "Start" : "Edit"}
                        </Link>
                      </div>
                    );
                  })}
                </div>

                {/* Completed card */}
                <div className="card">
                  <div className="card-head">
                    <h2 className="card-title">Completed</h2>
                    <SeeAllLink href="/stories" label={`View ${completedCount}`} />
                  </div>
                  {completedStories.slice(0, 5).map((s) => {
                    const linked = getLinkedCount(s.id, userQuestions);
                    return (
                      <Link
                        key={s.id}
                        href={`/stories/${s.id}`}
                        className="story-row"
                        style={{ textDecoration: "none" }}
                      >
                        <div className="dot dot-done" aria-hidden />
                        <div className="story-row-info">
                          <div className="story-row-title">{s.title}</div>
                          <div className="story-row-meta">
                            Linked to {linked} question{linked !== 1 ? "s" : ""}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Right column: Category coverage + Saved questions */}
              <div className="col-stack">
                {/* Category coverage card */}
                <div className="card">
                  <div className="card-head">
                    <h2 className="card-title">Category coverage</h2>
                  </div>
                  <div>
                    {CATEGORIES.map((cat) => {
                      const count = categoryCounts[cat] ?? 0;
                      const pct = Math.min(
                        100,
                        Math.round((count / CATEGORY_GOAL) * 100)
                      );
                      const isBelowAlert = count < 2;
                      return (
                        <div
                          key={cat}
                          className={`progress-wrap${
                            isBelowAlert ? " progress-wrap-alert" : ""
                          }`}
                        >
                          <div className="progress-label">
                            <span className="progress-label-text">{cat}</span>
                            <span className="progress-label-count">{count}</span>
                          </div>
                          <div className="progress-bg">
                            <div
                              className={`progress-fill${
                                isBelowAlert ? " warn" : ""
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Saved questions card */}
                <div className="card">
                  <div className="card-head">
                    <h2 className="card-title">Saved questions</h2>
                    <SeeAllLink href="/saved-questions" label="View all" />
                  </div>
                  {userQuestions
                    .slice()
                    .sort((a, b) => b.stories.length - a.stories.length)
                    .slice(0, 5)
                    .map((uq) => {
                      const linkedCount = uq.stories.length;
                      const hasStory = linkedCount > 0;
                      return (
                        <div key={uq.id} className="q-row">
                          <div className={`q-icon ${hasStory ? "q-done" : "q-empty"}`} />
                          <div className="q-txt">{uq.question.content}</div>
                          <div className={`q-n${!hasStory ? " q-warn" : ""}`}>
                            {hasStory
                              ? `${linkedCount} story${linkedCount !== 1 ? "s" : ""}`
                              : "No story"}
                          </div>
                        </div>
                      );
                    })}
                  <div className="cta-row" style={{ marginTop: 12 }}>
                    <Link href="/saved-questions" className="btn-secondary">
                      Browse
                    </Link>
                    <Link href="/saved-questions" className="btn-primary">
                      Link more stories
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
    </main>
  );
}
