"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";

const PUBLIC_PATHS = ["/", "/login", "/signup", "/about"];

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPublicPage = pathname ? PUBLIC_PATHS.includes(pathname) : false;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isPublicPage) {
    return <>{children}</>;
  }

  return (
    <div className={`app-layout${sidebarOpen ? " sidebar-is-open" : ""}`}>
      <div className="app-layout-sidebar-col">
        <div
          className={`sidebar-backdrop${sidebarOpen ? " sidebar-backdrop--visible" : ""}`}
          aria-hidden
          onClick={() => setSidebarOpen(false)}
        />
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>
      <div className="app-layout-body">
        <button
          type="button"
          className="mobile-menu-btn"
          aria-label="Open menu"
          onClick={() => setSidebarOpen(true)}
        >
          <svg viewBox="0 0 24 24" width={20} height={20} stroke="currentColor" strokeWidth={2} fill="none" aria-hidden>
            <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round" />
          </svg>
        </button>
        {children}
      </div>
    </div>
  );
}
