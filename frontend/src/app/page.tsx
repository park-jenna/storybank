"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import BrowserFrame from "@/components/BrowserFrame";
import DashboardPreview from "@/components/DashboardPreview";
import { useSessionToken } from "@/lib/session";

export default function HomePage() {
  const router = useRouter();
  const hasToken = !!useSessionToken();

  return (
    <main className="landing-page">
      {/* Hero */}
      <div className="landing-hero">
        <div className="landing-hero-copy">
          <h1 className="landing-hero-title">
            Prepare your interview stories,
            <br />
            all in one place
          </h1>
          <p className="landing-hero-subtitle">
            Write your STAR stories, tag them by category, and link them to
            common interview questions — so you&apos;re never caught off guard.
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

          <Link href="/about?returnTo=/" className="landing-about-link">
            About this project →
          </Link>
        </div>

        <div className="landing-preview">
          <BrowserFrame
            url="storybank-star.vercel.app/dashboard"
            className="landing-preview-frame"
          >
            <div className="landing-preview-scale">
              <DashboardPreview />
            </div>
          </BrowserFrame>
        </div>
      </div>
    </main>
  );
}
