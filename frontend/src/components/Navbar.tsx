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
    <nav className="navbar-top">
      <div className="navbar-inner">
        <div className="flex items-center justify-end gap-4">
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
