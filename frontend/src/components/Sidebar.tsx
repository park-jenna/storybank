"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "⌂" },
  { href: "/stories", label: "Stories", icon: "📚" },
  { href: "/stories/new", label: "New Story", icon: "+" },
] as const;

const SUPPORT_EMAIL = "jennapark@gatech.edu";

type SidebarProps = {
  onClose?: () => void;
};

export default function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();

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
          <span className="sidebar-logo-icon" aria-hidden>
            📖
          </span>
          StoryBank
        </Link>

        <nav className="sidebar-nav">
          {navItems.map(({ href, label, icon }) => {
            const isDashboard = href === "/dashboard";
            const isStories = href === "/stories";
            const isActive =
              pathname === href ||
              (isDashboard && pathname === "/") ||
              (isStories &&
                pathname?.startsWith("/stories") &&
                pathname !== "/stories/new");
            return (
              <Link
                key={href + label}
                href={href}
                className={`sidebar-link ${isActive ? "sidebar-link-active" : ""}`}
                onClick={onClose}
              >
                <span className="sidebar-link-icon" aria-hidden>
                  {icon}
                </span>
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-upgrade-card">
          <div className="sidebar-upgrade-card-title">
            <span aria-hidden>🎯</span>
            Practice
          </div>
          <div className="sidebar-upgrade-card-desc">
            Tips to strengthen your STAR stories for interviews.
          </div>
          <button
            type="button"
            className="btn"
            aria-label="Practice (coming soon)"
            onClick={(e) => e.preventDefault()}
          >
            Coming soon
          </button>
        </div>

        <div className="sidebar-bottom-links">
          <Link href="/dashboard" className="sidebar-bottom-link" onClick={onClose}>
            <span aria-hidden>⚙️</span>
            Settings
          </Link>
          <a
            href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("StoryBank Support")}`}
            className="sidebar-bottom-link"
            onClick={() => onClose?.()}
          >
            <span aria-hidden>💬</span>
            Support
          </a>
        </div>
      </div>
    </aside>
  );
}
