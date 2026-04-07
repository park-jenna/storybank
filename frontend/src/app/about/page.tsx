"use client";

import { useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import BrowserFrame from "@/components/BrowserFrame";
import { safeInternalReturnPath } from "@/lib/navigation";

const STACK = [
  { layer: "Frontend", tech: "Next.js 16, React 19\nTypeScript, Tailwind CSS" },
  { layer: "Backend", tech: "Express.js, Node.js\nZod (validation)" },
  { layer: "Database", tech: "PostgreSQL\nPrisma ORM" },
  { layer: "Auth & Deploy", tech: "JWT, bcrypt\nVercel" },
];

const FEATURES = [
  {
    id: "auth",
    title: "JWT-based authentication with signup and login",
    sub: "Passwords hashed with bcrypt · token stored in localStorage",
    screenshot: "/img/about/auth.png",
    frameUrl: "storybank-star.vercel.app",
  },
  {
    id: "stories",
    title: "Full CRUD for STAR-format stories",
    sub: "Title, categories, situation, action, result · per-user data isolation",
    screenshot: "/img/about/stories.png",
    frameUrl: "storybank-star.vercel.app/stories",
  },
  {
    id: "questions",
    title: "Question bank with story linking",
    sub: "Save questions from a curated list · link one or more stories as answers",
    screenshot: "/img/about/questions.png",
    frameUrl: "storybank-star.vercel.app/common-questions",
  },
  {
    id: "dashboard",
    title: "Dashboard with category coverage tracking",
    sub: "Progress overview, in-progress stories, unlinked questions at a glance",
    screenshot: "/img/dashboard.png",
    frameUrl: "storybank-star.vercel.app/dashboard",
  },
  {
    id: "api",
    title: "REST API with input validation",
    sub: "Express routes · Zod schemas · Prisma for type-safe DB queries",
  },
];

function FeatureScreenshot({
  src,
  alt,
  placeholderHint,
}: {
  src: string;
  alt: string;
  placeholderHint: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="about-feature-shot-placeholder">
        <span className="about-feature-shot-placeholder-text">
          {placeholderHint}
        </span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- optional local assets; graceful fallback on error
    <img
      src={src}
      alt={alt}
      className="about-feature-shot-img"
      onError={() => setFailed(true)}
    />
  );
}

export default function AboutPage() {
  const router = useRouter();
  const baseId = useId();
  const [openId, setOpenId] = useState<string | null>(null);
  const [backHref, setBackHref] = useState("/");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ret = safeInternalReturnPath(params.get("returnTo"));
    const token = localStorage.getItem("token");
    setBackHref(ret ?? (token ? "/dashboard" : "/"));
  }, []);

  return (
    <main className="about-page">
      <div className="about-content">
        {/* Back */}
        <button
          className="back-btn"
          type="button"
          onClick={() => router.push(backHref)}
        >
          <svg viewBox="0 0 14 14" className="inline-icon">
            <path d="M9 2L4 7l5 5" />
          </svg>
          Back to app
        </button>

        {/* Header */}
        <div className="about-header">
          <h1 className="about-title">StoryBank</h1>
          <p className="about-sub">
            A full-stack web app for preparing behavioral interviews. Built to
            practice end-to-end product development — from database schema to
            deployed UI.
          </p>
        </div>

        {/* Why */}
        <div className="about-section">
          <div className="about-section-label">Why I built this</div>
          <div className="card">
            <p className="body-copy-sm">
              I kept re-writing the same interview stories across different job
              applications with no consistent structure. I wanted a tool that
              would let me write each story once, organize them using the STAR
              method, and quickly find the right one for any interview question.
              StoryBank is that tool — and a chance to build something full-stack
              from scratch.
            </p>
          </div>
        </div>

        {/* Stack */}
        <div className="about-section">
          <div className="about-section-label">Tech stack</div>
          <div className="about-stack-grid">
            {STACK.map(({ layer, tech }) => (
              <div key={layer} className="about-stack-item">
                <div className="about-stack-layer">{layer}</div>
                <div className="about-stack-tech stack-lines">
                  {tech.split("\n").map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="about-section">
          <div className="about-section-label">What I built</div>
          <div className="card about-feature-card">
            {FEATURES.map(({ id, title, sub, screenshot, frameUrl }, i) => {
              const isOpen = openId === id;
              const panelId = `${baseId}-panel-${id}`;
              const hint = screenshot
                ? `Add ${screenshot.replace(/^\/img\//, "public/img/")} to show a preview.`
                : "";
              return (
                <div
                  key={id}
                  className={`about-feature-block${i < FEATURES.length - 1 ? " about-feature-block--divided" : ""}`}
                >
                  <button
                    type="button"
                    className="about-feature-trigger"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    id={`${baseId}-trigger-${id}`}
                    onClick={() => setOpenId(isOpen ? null : id)}
                  >
                    <span
                      className="dot dot-done about-feature-dot"
                      aria-hidden
                    />
                    <span className="about-feature-trigger-text">
                      <span className="about-feature-title">{title}</span>
                      <span className="about-feature-sub">{sub}</span>
                    </span>
                    <span
                      className={`about-feature-chevron${isOpen ? " about-feature-chevron-open" : ""}`}
                      aria-hidden
                    >
                      <svg viewBox="0 0 12 12" width={12} height={12}>
                        <path
                          d="M3 4.5L6 7.5L9 4.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </button>
                  {isOpen && (
                    <div
                      className="about-feature-panel"
                      id={panelId}
                      role="region"
                      aria-labelledby={`${baseId}-trigger-${id}`}
                    >
                      {screenshot ? (
                        <BrowserFrame
                          url={frameUrl}
                          className="about-feature-frame"
                        >
                          <FeatureScreenshot
                            src={screenshot}
                            alt={`Screenshot: ${title}`}
                            placeholderHint={hint}
                          />
                        </BrowserFrame>
                      ) : (
                        <div className="about-feature-api-note">
                          <p className="about-feature-api-note-text">
                            This layer is server-side only—no UI to capture. See
                            the Express app in the repo for routes and Zod
                            validation.
                          </p>
                          <a
                            href="https://github.com/park-jenna/storybank"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="about-feature-api-note-link"
                          >
                            View on GitHub →
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Preview */}
        {/* Preview removed */}

        {/* Links */}
        <div className="about-section">
          <div className="about-section-label">Links</div>
          <div className="about-links-row">
            <a
              href="https://github.com/park-jenna/storybank"
              target="_blank"
              rel="noopener noreferrer"
              className="about-link-card"
            >
              <div className="about-link-icon">
                <svg
                  viewBox="0 0 16 16"
                  style={{
                    width: 14,
                    height: 14,
                    stroke: "var(--text-secondary)",
                    fill: "none",
                    strokeWidth: 1.5,
                    strokeLinecap: "round",
                  }}
                >
                  <path d="M8 1C4.13 1 1 4.13 1 8c0 3.09 2 5.71 4.79 6.63.35.06.48-.15.48-.34v-1.2c-1.95.42-2.36-.94-2.36-.94-.32-.81-.78-1.03-.78-1.03-.63-.43.05-.42.05-.42.7.05 1.07.72 1.07.72.62 1.07 1.63.76 2.03.58.06-.45.24-.76.44-.94-1.55-.18-3.19-.78-3.19-3.46 0-.76.27-1.39.72-1.88-.07-.18-.31-.89.07-1.85 0 0 .59-.19 1.93.72A6.7 6.7 0 018 4.84c.6 0 1.2.08 1.76.24 1.34-.91 1.93-.72 1.93-.72.38.96.14 1.67.07 1.85.45.49.72 1.12.72 1.88 0 2.69-1.64 3.28-3.2 3.45.25.22.48.64.48 1.29v1.92c0 .19.13.4.48.34A7.001 7.001 0 0015 8c0-3.87-3.13-7-7-7z" />
                </svg>
              </div>
              <div>
                <div className="about-link-label">GitHub</div>
                <div className="about-link-sub">Source code & README</div>
              </div>
              <div className="about-link-arrow">→</div>
            </a>
            <a
              href="https://storybank-star.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="about-link-card"
            >
              <div className="about-link-icon">
                <svg
                  viewBox="0 0 16 16"
                  style={{
                    width: 14,
                    height: 14,
                    stroke: "var(--text-secondary)",
                    fill: "none",
                    strokeWidth: 1.5,
                    strokeLinecap: "round",
                  }}
                >
                  <rect x="1" y="2" width="14" height="10" rx="1.5" />
                  <path d="M5 14h6M8 12v2" />
                </svg>
              </div>
              <div>
                <div className="about-link-label">Live demo</div>
                <div className="about-link-sub">storybank-star.vercel.app</div>
              </div>
              <div className="about-link-arrow">→</div>
            </a>
          </div>
        </div>

        {/* Builder */}
        <div className="about-builder">
          <div className="about-builder-avatar">JP</div>
          <div>
            <div className="about-builder-name">Jenna Park</div>
            <div className="about-builder-sub">
              Designed & built end-to-end · Georgia Tech
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
