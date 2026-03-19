"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setHasToken(!!token);
  }, []);

  return (
    <main className="landing-page">
      {/* Hero */}
      <div className="landing-hero">
        <h1 className="landing-hero-title">
          Prepare your interview stories,
          <br />
          all in one place
        </h1>
        <p className="landing-hero-subtitle">
          Write your STAR stories, tag them by category, and link them to common
          interview questions — so you&apos;re never caught off guard.
        </p>
        <div className="landing-cta-row">
          {hasToken ? (
            <button
              type="button"
              className="btn-primary"
              onClick={() => router.push("/dashboard")}
            >
              Go to Dashboard
            </button>
          ) : (
            <>
              <button
                type="button"
                className="btn-primary"
                onClick={() => router.push("/signup")}
              >
                Get started
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => router.push("/login")}
              >
                Log in
              </button>
            </>
          )}
        </div>
      </div>

      <div className="landing-features">
        {[
          "Create and save behavioral interview stories",
          "Edit and refine responses over time",
          "Securely manage your own data with login",
        ].map((item) => (
          <div key={item} className="landing-feature-item">
            <div className="dot dot-done landing-feature-dot" aria-hidden />
            {item}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="landing-footer">
        <Link href="/about" className="landing-footer-about">
          About this project →
        </Link>
      </div>
    </main>
  );
}
