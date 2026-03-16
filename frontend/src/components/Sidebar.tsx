"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchStories } from "@/lib/stories";
import { fetchUserQuestions } from "@/lib/user-questions";

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
  { href: "/common-questions", label: "Common Questions", badgeKey: null },
] as const;

const USER_DISPLAY_NAME = "User"; // TODO: from auth when available
const USER_INITIALS = "U";

type SidebarProps = {
  onClose?: () => void;
};

export default function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
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
  }, []);

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
            return (
              <Link
                key={href + label}
                href={href}
                className={`sidebar-link ${isActive ? "sidebar-link-active" : ""}`}
                onClick={onClose}
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
                  {href === "/common-questions" && (
                    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                      <path d="M12 17h.01" />
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
                  <span className="sidebar-badge" aria-label={`${badge}`}>
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-spacer" />

        <div className="sidebar-profile">
          <div className="sidebar-avatar" aria-hidden>
            {USER_INITIALS}
          </div>
          <div className="sidebar-profile-info">
            <div className="sidebar-profile-name">{USER_DISPLAY_NAME}</div>
            <div className="sidebar-profile-sub">Interview prep</div>
          </div>
        </div>

        <div className="sidebar-bottom-links">
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
