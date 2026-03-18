"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setHasToken(!!token);
  }, []);

  return (
    <main className="landing-page">
      <div className="landing-hero">
        <h1 className="landing-hero-title">StoryBank</h1>
        <p className="landing-hero-subtitle">
          Save and organize stories for interviews
        </p>
      </div>

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
              onClick={() => router.push("/login")}
            >
              Log In
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => router.push("/signup")}
            >
              Sign Up
            </button>
          </>
        )}
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
    </main>
  );
}
