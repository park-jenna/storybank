"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchStories } from "@/lib/stories";
import { fetchUserQuestions } from "@/lib/user-questions";
import { useTheme } from "@/contexts/ThemeContext";

function storyProgress(s: { situation?: string | null; action?: string | null; result?: string | null }): number {
  let n = 0;
  if (s.situation?.trim()) n++;
  if (s.action?.trim()) n++;
  if (s.result?.trim()) n++;
  return Math.round((n / 3) * 100);
}

const PREPARE_ITEMS = [
  { href: "/stories", label: "My Stories", badgeKey: "stories" as const },
  { href: "/saved-questions", label: "Saved Questions", badgeKey: "questions" as const },
] as const;

const RESOURCE_ITEMS = [
  { href: "/common-questions", label: "Common Questions" },
  { href: "/interview-tips", label: "STAR method" },
] as const;

type SidebarProps = {
  onClose?: () => void;
};

export default function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [inProgressCount, setInProgressCount] = useState(0);
  const [unlinkedCount, setUnlinkedCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) return;
      try {
        const [storiesRes, uqRes] = await Promise.all([
          fetchStories(token),
          fetchUserQuestions(token),
        ]);
        if (cancelled) return;
        const inProgress = storiesRes.stories.filter((s) => storyProgress(s) < 100).length;
        const unlinked = uqRes.userQuestions.filter((uq) => uq.stories.length === 0).length;
        setInProgressCount(inProgress);
        setUnlinkedCount(unlinked);
      } catch {
        if (!cancelled) {
          setInProgressCount(0);
          setUnlinkedCount(0);
        }
      }
    }
    load();
    return () => { cancelled = true; };
  }, [pathname]);

  const isDashboardActive =
    pathname === "/dashboard" || pathname === "/";

  function handleLogout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
    router.replace("/login");
    if (onClose) {
      onClose();
    }
  }

  return (
    <aside className="sidebar" aria-label="Main navigation">
      <button
        type="button"
        className="sidebar-collapse"
        aria-label="Collapse sidebar"
        title="Collapse"
      >
        ‹
      </button>
      {onClose && (
        <button
          type="button"
          className="sidebar-close-mobile"
          aria-label="Close menu"
          onClick={onClose}
        >
          ×
        </button>
      )}

      <div className="sidebar-inner">
        <Link href="/" className="sidebar-logo">
          StoryBank
        </Link>

        <nav className="sidebar-nav" aria-label="Menu">
          <div className="sidebar-menu-label">MENU</div>
          <Link
            href="/dashboard"
            className={`sidebar-link ${isDashboardActive ? "sidebar-link-active" : ""}`}
            onClick={onClose}
          >
            <span className="sidebar-link-icon" aria-hidden>
              <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </span>
            Dashboard
          </Link>

          <div className="sidebar-menu-label">PREPARE</div>
          <Link
            href="/stories/new"
            className={`sidebar-link ${pathname === "/stories/new" ? "sidebar-link-active" : ""}`}
            onClick={onClose}
          >
            <span className="sidebar-link-icon" aria-hidden>
              <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
                <path d="M12 5v14M5 12h14" />
              </svg>
            </span>
            New story
          </Link>
          {PREPARE_ITEMS.map(({ href, label, badgeKey }) => {
            const isStories = href === "/stories";
            const isSavedQuestions = href === "/saved-questions";
            const isActive =
              pathname === href ||
              (isStories && pathname?.startsWith("/stories") && pathname !== "/stories/new") ||
              (isSavedQuestions && pathname?.startsWith("/saved-questions"));
            const badge =
              badgeKey === "stories" ? inProgressCount :
              badgeKey === "questions" ? unlinkedCount : null;
            const badgeTitle =
              badgeKey === "stories" && badge != null && badge > 0
                ? `${badge} stories still in progress`
                : badgeKey === "questions" && badge != null && badge > 0
                  ? `${badge} saved questions without linked stories`
                  : undefined;
            const badgeAriaLabel =
              badgeKey === "stories" && badge != null && badge > 0
                ? `${badge} stories in progress`
                : badgeKey === "questions" && badge != null && badge > 0
                  ? `${badge} saved questions without linked stories`
                  : badge != null
                    ? String(badge)
                    : undefined;
            return (
              <Link
                key={href + label}
                href={href}
                className={`sidebar-link ${isActive ? "sidebar-link-active" : ""}`}
                onClick={onClose}
                title={badgeTitle}
              >
                <span className="sidebar-link-icon" aria-hidden>
                  {href === "/stories" && (
                    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <path d="M14 2v6h6" />
                      <path d="M16 13H8" />
                      <path d="M16 17H8" />
                      <path d="M10 9H8" />
                    </svg>
                  )}
                  {href === "/saved-questions" && (
                    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                  )}
                </span>
                {label}
                {badge != null && badge > 0 && (
                  <span className="sidebar-badge" aria-label={badgeAriaLabel}>
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="sidebar-menu-label">RESOURCES</div>
          {RESOURCE_ITEMS.map(({ href, label }) => {
            const isActive =
              pathname === href ||
              (href === "/interview-tips" && pathname?.startsWith("/interview-tips"));
            return (
              <Link
                key={href + label}
                href={href}
                className={`sidebar-link ${isActive ? "sidebar-link-active" : ""}`}
                onClick={onClose}
              >
                <span className="sidebar-link-icon" aria-hidden>
                  {href === "/common-questions" && (
                    <svg
                      viewBox="0 0 24 24"
                      width={18}
                      height={18}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <circle cx="11" cy="11" r="6" />
                      <line x1="16" y1="16" x2="20" y2="20" />
                    </svg>
                  )}
                  {href === "/interview-tips" && (
                    <svg
                      viewBox="0 0 24 24"
                      width={18}
                      height={18}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </span>
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-spacer" />

        <div className="sidebar-bottom-links">
          <button
            type="button"
            className="sidebar-bottom-link"
            onClick={toggleTheme}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {theme === "dark" ? (
                <svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </span>
          </button>
          <button
            type="button"
            className="sidebar-bottom-link"
            onClick={handleLogout}
          >
            Log out
          </button>
        </div>
      </div>
    </aside>
  );
}
