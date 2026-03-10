"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

export default function HomePage() {
  const router = useRouter();
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setHasToken(!!token);
  }, []);

  return (
    <main className="landing-page">
      <header className="landing-hero">
        <h1 className="landing-hero-title">StoryBank</h1>
        <p className="landing-hero-subtitle muted">
          Save and organize stories for interviews
        </p>
      </header>

      <div className="landing-cta">
        {hasToken ? (
          <Button
            variant="primary"
            size="md"
            onClick={() => router.push("/dashboard")}
          >
            Go to Dashboard
          </Button>
        ) : (
          <>
            <Button
              variant="primary"
              size="md"
              onClick={() => router.push("/login")}
            >
              Log In
            </Button>
            <Button
              size="md"
              onClick={() => router.push("/signup")}
            >
              Sign Up
            </Button>
          </>
        )}
      </div>

      <section className="landing-features">
        <ul className="landing-features-list">
          <li>• Create and save behavioral interview stories</li>
          <li>• Edit and refine responses over time</li>
          <li>• Securely manage your own data with login</li>
        </ul>
      </section>

      <footer className="landing-footer">
        <p className="landing-footer-note muted">
          Demo project built for learning and portfolio purposes
        </p>
      </footer>
    </main>
  );
}