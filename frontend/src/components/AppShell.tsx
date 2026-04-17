"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { isAuthOptionalPathname, isBareLayoutPathname } from "@/lib/public-paths";
import { redirectToLogin, useSessionToken } from "@/lib/session";

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const authOptional = pathname ? isAuthOptionalPathname(pathname) : false;
  const bareLayout = pathname ? isBareLayoutPathname(pathname) : false;
  const token = useSessionToken();
  const sessionPending = token === undefined;
  const authReady = authOptional || (!sessionPending && !!token);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!pathname) return;
    if (sessionPending) return;
    if (authOptional || token) return;
    redirectToLogin(router);
  }, [authOptional, pathname, router, sessionPending, token]);

  if (bareLayout) {
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
