"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { isPublicPathname } from "@/lib/public-paths";

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isPublicPage = pathname ? isPublicPathname(pathname) : false;
  const [authReady, setAuthReady] = useState(isPublicPage);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!pathname) return;
    if (isPublicPathname(pathname)) {
      setAuthReady(true);
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      setAuthReady(false);
      const fullPath = `${window.location.pathname}${window.location.search}`;
      router.replace(`/login?returnTo=${encodeURIComponent(fullPath)}`);
      return;
    }
    setAuthReady(true);
  }, [pathname, router]);

  if (isPublicPage) {
    return <>{children}</>;
  }

  if (!authReady) {
    return (
      <div className="app-layout">
        <div className="app-layout-body">
          <main className="main-content">
            <p className="text-muted text-14">Loading…</p>
          </main>
        </div>
      </div>
    );
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
