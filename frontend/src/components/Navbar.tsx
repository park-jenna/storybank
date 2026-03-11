"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getButtonClassName, getButtonStyle } from "@/components/ui";
import { useTheme } from "@/contexts/ThemeContext";

/** Same as AppShell: minimal header (no search) on landing, login, signup */
const PUBLIC_PATHS = ["/", "/login", "/signup"];

type NavbarProps = {
  onMenuClick?: () => void;
};

export default function Navbar({ onMenuClick }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [hasToken, setHasToken] = useState(false);
  const [mounted, setMounted] = useState(false);

  const isPublicPage = pathname ? PUBLIC_PATHS.includes(pathname) : false;

  // Re-check token when route changes so login/signup → dashboard shows correct header
  useEffect(() => {
    setHasToken(!!localStorage.getItem("token"));
    setMounted(true);
  }, [pathname]);

  function handleLogout() {
    localStorage.removeItem("token");
    setHasToken(false);
    router.replace("/login");
  }

  return (
    <nav className={`navbar-top${isPublicPage ? " navbar-top--auth" : ""}`}>
      <div className="navbar-inner">
        {!isPublicPage && (
          <button
            type="button"
            className="navbar-menu-btn"
            aria-label="Open menu"
            onClick={onMenuClick}
          >
            ☰
          </button>
        )}
        {!isPublicPage && (
          <div className="navbar-search-wrap">
            <input
              type="search"
              placeholder="Search stories..."
              className="navbar-search"
              aria-label="Search stories"
            />
          </div>
        )}
        {isPublicPage && (
          <>
            <Link href="/" className="navbar-auth-home">
              StoryBank
            </Link>
            <div className="navbar-auth-spacer" />
          </>
        )}

        <div className="navbar-actions">
          {mounted && hasToken && (
            <>
              <Link
                href="/stories/new"
                className={getButtonClassName("primary", "sm")}
                style={getButtonStyle("primary", "sm")}
              >
                + New Story
              </Link>
              <div className="navbar-user">
                <div className="navbar-user-avatar">U</div>
                <div className="navbar-user-info">
                  <div className="navbar-user-name">User</div>
                  <div className="navbar-user-role">StoryBank</div>
                </div>
              </div>
              <button
                type="button"
                className="navbar-icon-btn navbar-theme-toggle"
                aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                onClick={toggleTheme}
                title={theme === "dark" ? "Light mode" : "Dark mode"}
              >
                <span aria-hidden>{theme === "dark" ? "☀️" : "🌙"}</span>
              </button>
              <button
                type="button"
                className={getButtonClassName("default", "sm")}
                style={getButtonStyle("default", "sm")}
                onClick={handleLogout}
              >
                Log out
              </button>
            </>
          )}
          {mounted && !hasToken && (
            <>
              <button
                type="button"
                className="navbar-icon-btn navbar-theme-toggle"
                aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                onClick={toggleTheme}
                title={theme === "dark" ? "Light mode" : "Dark mode"}
              >
                <span aria-hidden>{theme === "dark" ? "☀️" : "🌙"}</span>
              </button>
              <Link
                href="/login"
                className={getButtonClassName("default", "md")}
                style={getButtonStyle("default", "md")}
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className={getButtonClassName("primary", "md")}
                style={getButtonStyle("primary", "md")}
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
