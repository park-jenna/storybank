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
      className="w-[280px] min-w-[280px] flex-shrink-0 self-stretch border-r border-[var(--border-light)] bg-[var(--sidebar-bg)]"
      aria-label="Main navigation"
    >
      <nav className="py-6 flex flex-col gap-2">
        {navItems.map(({ href, label, icon }) => {
          const isActive =
            pathname === href ||
            (href === "/dashboard" && pathname?.startsWith("/stories") && pathname !== "/stories/new");
          return (
            <Link
              key={href + label}
              href={href}
              className={`flex items-center gap-4 px-6 py-4 mx-3 rounded-xl text-[19px] font-medium no-underline transition-colors ${
                isActive
                  ? "bg-[var(--primary)]"
                  : "text-[var(--foreground)] hover:bg-[var(--border-light)]"
              }`}
              style={isActive ? { color: "white" } : undefined}
            >
              <span className="text-xl w-8 text-center" aria-hidden>
                {icon}
              </span>
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
