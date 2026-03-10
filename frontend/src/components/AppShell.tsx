"use client";

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

  return (
    <div
      className={`layout-wrapper${isPublicPage ? " layout-wrapper--auth" : ""}`}
    >
      {!isPublicPage && <Sidebar />}
      <div className={`layout-right${isPublicPage ? " layout-right--auth" : ""}`}>
        <Navbar />
        <main className="layout-main">
          <div className={`app-shell${isPublicPage ? " app-shell--auth" : ""}`}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
