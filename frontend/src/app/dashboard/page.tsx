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

function OnboardingDocIcon() {
  return (
    <svg
      className="dashboard-onboarding-icon-svg"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M14 2v6h6M9 13h6M9 17h4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function OnboardingLinkIcon() {
  return (
    <svg
      className="dashboard-onboarding-icon-svg"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function OnboardingTagIcon() {
  return (
    <svg
      className="dashboard-onboarding-icon-svg"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M12 2H2v10l9.29 9.29a2 2 0 0 0 2.83 0l6.58-6.58a2 2 0 0 0 0-2.83L12 2Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <circle cx="7" cy="7" r="1.25" fill="currentColor" />
    </svg>
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
          setError("Session expired. Please log in again.");
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
        const msg = err instanceof Error ? err.message : "Failed to load stories.";
        // api layer will redirect on auth failure; keep a friendly message for the brief moment before navigation
        const friendly =
          /invalid\s*token|token\s*expired|expired\s*token|jwt\s*expired|unauthorized|401/i.test(msg)
            ? "Session expired. Please log in again."
            : msg;
        setError(friendly);
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
  const missingCategories = useMemo(() => {
    return CATEGORIES.filter((c) => (categoryCounts[c] ?? 0) === 0);
  }, [categoryCounts]);

  const missingCategorySummary = useMemo(() => {
    if (missingCategories.length === 0) return null;
    const first = missingCategories[0];
    const moreCount = missingCategories.length - 1;
    return moreCount > 0 ? `Missing: ${first} +${moreCount} more` : `Missing: ${first}`;
  }, [missingCategories]);

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

      {!loading && !error && (
          <>
            {/* Page header: Welcome + subtitle + New story */}
            <header className="page-header">
              <div className="page-header-left">
                <h1 className="page-title">{hasAnyStories ? "Welcome back" : "Welcome"}</h1>
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

            {!hasAnyStories && (
              <section
                className="dashboard-onboarding card"
                aria-labelledby="dashboard-onboarding-title"
              >
                <div className="dashboard-onboarding-head">
                  <p className="dashboard-onboarding-eyebrow">Getting started</p>
                  <h2
                    id="dashboard-onboarding-title"
                    className="dashboard-onboarding-title"
                  >
                    Quick tips
                  </h2>
                  <p className="dashboard-onboarding-lead">
                    Create a story with categories and STAR fields, then save
                    interview questions and link them to that story. This page
                    shows where you still have gaps.
                  </p>
                </div>
                <ol className="dashboard-onboarding-list">
                  <li className="dashboard-onboarding-item">
                    <div className="dashboard-onboarding-item-inner">
                      <div className="dashboard-onboarding-item-top">
                        <span className="dashboard-onboarding-icon-wrap">
                          <OnboardingDocIcon />
                        </span>
                        <span className="dashboard-onboarding-step-label">
                          Step 1
                        </span>
                      </div>
                      <p className="dashboard-onboarding-item-title">
                        Create your first story
                      </p>
                      <p className="dashboard-onboarding-item-text">
                        Use <strong>+ New story</strong>. On one screen you pick{" "}
                        <strong>categories</strong> (they power the coverage chart
                        below), then fill <strong>Situation</strong>,{" "}
                        <strong>Action</strong>, and <strong>Result</strong>.
                      </p>
                      <div className="dashboard-onboarding-cta">
                        <Link
                          href="/stories/new"
                          className="dashboard-onboarding-link"
                        >
                          Start a story
                          <span aria-hidden> →</span>
                        </Link>
                      </div>
                    </div>
                  </li>
                  <li className="dashboard-onboarding-item">
                    <div className="dashboard-onboarding-item-inner">
                      <div className="dashboard-onboarding-item-top">
                        <span className="dashboard-onboarding-icon-wrap">
                          <OnboardingLinkIcon />
                        </span>
                        <span className="dashboard-onboarding-step-label">
                          Step 2
                        </span>
                      </div>
                      <p className="dashboard-onboarding-item-title">
                        Save questions and link stories
                      </p>
                      <p className="dashboard-onboarding-item-text">
                        In <strong>Common Questions</strong>, save prompts you want
                        to practice. Open <strong>Saved Questions</strong> and
                        link each prompt to the stories that answer it.
                      </p>
                      <div className="dashboard-onboarding-cta dashboard-onboarding-cta--split">
                        <Link
                          href="/common-questions"
                          className="dashboard-onboarding-link"
                        >
                          Common Questions
                          <span aria-hidden> →</span>
                        </Link>
                        <span
                          className="dashboard-onboarding-cta-sep"
                          aria-hidden
                        >
                          ·
                        </span>
                        <Link
                          href="/saved-questions"
                          className="dashboard-onboarding-link"
                        >
                          Saved Questions
                          <span aria-hidden> →</span>
                        </Link>
                      </div>
                    </div>
                  </li>
                  <li className="dashboard-onboarding-item">
                    <div className="dashboard-onboarding-item-inner">
                      <div className="dashboard-onboarding-item-top">
                        <span className="dashboard-onboarding-icon-wrap">
                          <OnboardingTagIcon />
                        </span>
                        <span className="dashboard-onboarding-step-label">
                          Step 3
                        </span>
                      </div>
                      <p className="dashboard-onboarding-item-title">
                        Track prep on the dashboard
                      </p>
                      <p className="dashboard-onboarding-item-text">
                        See <strong>STAR</strong> completion, how many questions
                        are linked to stories, and <strong>category</strong> gaps
                        below. Refine stories or links anytime from{" "}
                        <strong>My Stories</strong> or <strong>Saved Questions</strong>.
                      </p>
                      <div className="dashboard-onboarding-cta">
                        <Link href="/stories" className="dashboard-onboarding-link">
                          Open My Stories
                          <span aria-hidden> →</span>
                        </Link>
                      </div>
                    </div>
                  </li>
                </ol>
              </section>
            )}

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
              <div className="stat-card">
                <div className="stat-label">Category coverage</div>
                <div className={`stat-value${missingCategorySummary ? " warn" : ""}`}>
                  {categoryCoveredCount}/{CATEGORIES.length}
                </div>
                <div className={`stat-sub${missingCategorySummary ? " warn" : ""}`}>
                  {missingCategorySummary ?? "All covered"}
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
                  {inProgressStories.length === 0 ? (
                    <p className="card-empty-hint">No stories in progress. Create one to get started.</p>
                  ) : null}
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
                          href={`/stories/${s.id}/edit?from=${encodeURIComponent("/dashboard")}`}
                          className="btn-row story-row-action"
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
                    <SeeAllLink href="/stories" label={completedCount > 0 ? `View ${completedCount}` : "View all"} />
                  </div>
                  {completedStories.length === 0 ? (
                    <p className="card-empty-hint">Complete a STAR story to see it here.</p>
                  ) : null}
                  {completedStories.slice(0, 5).map((s) => {
                    const linked = getLinkedCount(s.id, userQuestions);
                    return (
                      <Link
                        key={s.id}
                        href={`/stories/${s.id}`}
                        className="story-row story-row--dashboard"
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
                            <Link
                              href={`/stories?category=${encodeURIComponent(cat)}`}
                              className="progress-label-text"
                            >
                              {cat}
                            </Link>
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
                  {userQuestions.length === 0 ? (
                    <p className="card-empty-hint">Save interview questions and link them to your stories.</p>
                  ) : null}
                  {userQuestions
                    .slice()
                    .sort((a, b) => b.stories.length - a.stories.length)
                    .slice(0, 5)
                    .map((uq) => {
                      const linkedCount = uq.stories.length;
                      const hasStory = linkedCount > 0;
                      return (
                        <Link
                          key={uq.id}
                          href={`/saved-questions/${uq.id}`}
                          className="q-row"
                        >
                          <div className={`q-icon ${hasStory ? "q-done" : "q-empty"}`} />
                          <div className="q-txt">{uq.question.content}</div>
                          <div className={`q-n${!hasStory ? " q-warn" : ""}`}>
                            {hasStory
                              ? `${linkedCount} story${linkedCount !== 1 ? "s" : ""}`
                              : "No story"}
                          </div>
                        </Link>
                      );
                    })}
                  <div className="cta-row mt-3">
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
