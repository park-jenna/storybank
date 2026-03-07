"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getButtonClassName, getButtonStyle } from "@/components/ui";

export default function Navbar() {
  const router = useRouter();
  const [hasToken, setHasToken] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setHasToken(!!localStorage.getItem("token"));
    setMounted(true);
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    setHasToken(false);
    router.replace("/login");
  }

  return (
    <nav className="sticky top-0 z-50 bg-[var(--card)] border-b border-[var(--border-light)] px-6 py-4 flex items-center justify-between w-full max-w-full">
      <Link
        href="/"
        className="text-xl font-extrabold text-[var(--foreground)] no-underline tracking-tight"
      >
        StoryBank
      </Link>

      <div className="flex items-center gap-3">
        {mounted && hasToken && (
          <>
            <Link
              href="/dashboard"
              className={getButtonClassName("default", "sm")}
              style={getButtonStyle("default", "sm")}
            >
              Dashboard
            </Link>
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
            <Link
              href="/login"
              className={getButtonClassName("default", "sm")}
              style={getButtonStyle("default", "sm")}
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className={getButtonClassName("primary", "sm")}
              style={getButtonStyle("primary", "sm")}
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
