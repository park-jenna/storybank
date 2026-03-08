"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "⌂" },
  { href: "/dashboard", label: "Story Library", icon: "📚" },
  { href: "/stories/new", label: "Add New Story", icon: "+" },
] as const;

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="sidebar"
      aria-label="Main navigation"
    >
      <div className="sidebar-inner">
        <Link
          href="/"
          className="sidebar-logo"
        >
          StoryBank
        </Link>
        <nav className="sidebar-nav">
          {navItems.map(({ href, label, icon }) => {
            const isActive =
              pathname === href ||
              (href === "/dashboard" && pathname?.startsWith("/stories") && pathname !== "/stories/new");
            return (
              <Link
                key={href + label}
                href={href}
                className={`sidebar-link ${isActive ? "sidebar-link-active" : ""}`}
                style={isActive ? { color: "var(--primary)" } : undefined}
              >
                <span className="sidebar-link-icon" aria-hidden>
                  {icon}
                </span>
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
