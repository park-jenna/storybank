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
            One place for your interview{"\u00a0"}stories
          </h1>
          <p className="landing-hero-subtitle">
            One well-structured story can flex to leadership, problem-solving,
            and communication, depending on how you frame it.
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
