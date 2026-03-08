"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "⌂" },
  { href: "/dashboard", label: "Stories", icon: "📚" },
  { href: "/stories/new", label: "Add Story", icon: "+" },
] as const;

export default function Sidebar() {
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

      <div className="sidebar-inner">
        <Link href="/" className="sidebar-logo">
          <span className="sidebar-logo-icon" aria-hidden>
            📖
          </span>
          StoryBank
        </Link>

        <div className="sidebar-search-wrap">
          <input
            type="search"
            placeholder="Q Search"
            className="sidebar-search"
            aria-label="Search"
          />
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ href, label, icon }) => {
            const isActive =
              pathname === href ||
              (href === "/dashboard" &&
                pathname?.startsWith("/stories") &&
                pathname !== "/stories/new");
            return (
              <Link
                key={href + label}
                href={href}
                className={`sidebar-link ${isActive ? "sidebar-link-active" : ""}`}
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
            <span aria-hidden>👑</span>
            Upgrade to Pro
          </div>
          <div className="sidebar-upgrade-card-desc">
            Unlock all feature now
          </div>
          <Link href="/stories/new" className="btn">
            Upgrade Now
          </Link>
        </div>

        <div className="sidebar-bottom-links">
          <Link href="/dashboard" className="sidebar-bottom-link">
            <span aria-hidden>⚙️</span>
            Settings
          </Link>
          <a
            href="#"
            className="sidebar-bottom-link"
            onClick={(e) => e.preventDefault()}
          >
            <span aria-hidden>💬</span>
            Support
          </a>
        </div>
      </div>
    </aside>
  );
}
