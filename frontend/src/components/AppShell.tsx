"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

/** Routes that use minimal layout (no sidebar): landing, login, signup */
const PUBLIC_PATHS = ["/", "/login", "/signup"];

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPublicPage = pathname ? PUBLIC_PATHS.includes(pathname) : false;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div
      className={`layout-wrapper${isPublicPage ? " layout-wrapper--auth" : ""}${!isPublicPage && sidebarOpen ? " sidebar-is-open" : ""}`}
    >
      {!isPublicPage && (
        <>
          <div
            className="sidebar-backdrop"
            aria-hidden
            onClick={() => setSidebarOpen(false)}
          />
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </>
      )}
      <div className={`layout-right${isPublicPage ? " layout-right--auth" : ""}`}>
        <Navbar
          onMenuClick={!isPublicPage ? () => setSidebarOpen(true) : undefined}
        />
        <main className="layout-main">
          <div className={`app-shell${isPublicPage ? " app-shell--auth" : ""}`}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
