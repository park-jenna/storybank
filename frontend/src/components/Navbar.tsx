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
    <nav className="sticky top-0 z-50 bg-[var(--card)] border-b border-[var(--border-light)] w-full">
      <div className="max-w-[1400px] mx-auto px-8 py-5 flex items-center justify-between">
        <Link
          href="/"
          className="text-2xl font-extrabold text-[var(--foreground)] no-underline tracking-tight"
        >
          StoryBank
        </Link>

        <div className="flex items-center gap-4">
        {mounted && hasToken && (
          <>
            <Link
              href="/dashboard"
              className={getButtonClassName("default", "md")}
              style={getButtonStyle("default", "md")}
            >
              Dashboard
            </Link>
            <button
              type="button"
              className={getButtonClassName("default", "md")}
              style={getButtonStyle("default", "md")}
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
