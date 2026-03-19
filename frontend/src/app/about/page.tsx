"use client";

import { useRouter } from "next/navigation";

const STACK = [
  { layer: "Frontend", tech: "Next.js 16, React 19\nTypeScript, Tailwind CSS" },
  { layer: "Backend", tech: "Express.js, Node.js\nZod (validation)" },
  { layer: "Database", tech: "PostgreSQL\nPrisma ORM" },
  { layer: "Auth & Deploy", tech: "JWT, bcrypt\nVercel" },
];

const FEATURES = [
  {
    title: "JWT-based authentication with signup and login",
    sub: "Passwords hashed with bcrypt · token stored in localStorage",
  },
  {
    title: "Full CRUD for STAR-format stories",
    sub: "Title, categories, situation, action, result · per-user data isolation",
  },
  {
    title: "Question bank with story linking",
    sub: "Save questions from a curated list · link one or more stories as answers",
  },
  {
    title: "Dashboard with category coverage tracking",
    sub: "Progress overview, in-progress stories, unlinked questions at a glance",
  },
  {
    title: "REST API with input validation",
    sub: "Express routes · Zod schemas · Prisma for type-safe DB queries",
  },
];

export default function AboutPage() {
  const router = useRouter();

  return (
    <main className="about-page">
      <div className="about-content">
        {/* Back */}
        <button
          className="back-btn"
          type="button"
          onClick={() => router.push("/")}
        >
          <svg
            viewBox="0 0 14 14"
            style={{
              width: 14,
              height: 14,
              fill: "none",
              stroke: "currentColor",
              strokeWidth: 2,
              strokeLinecap: "round",
            }}
          >
            <path d="M9 2L4 7l5 5" />
          </svg>
          Back to app
        </button>

        {/* Header */}
        <div className="about-header">
          <div className="about-tag">Portfolio project · 2025</div>
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
            <p
              style={{
                fontSize: 14,
                color: "var(--text-secondary)",
                lineHeight: 1.75,
                margin: 0,
              }}
            >
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
                <div className="about-stack-tech">
                  {tech.split("\n").map((line) => (
                    <span key={line} style={{ display: "block" }}>
                      {line}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="about-section">
          <div className="about-section-label">What I built</div>
          <div className="card" style={{ padding: "1.125rem 1.5rem" }}>
            {FEATURES.map(({ title, sub }, i) => (
              <div
                key={title}
                className="about-feature-item"
                style={{
                  borderBottom:
                    i < FEATURES.length - 1
                      ? "0.5px solid var(--border-card)"
                      : "none",
                }}
              >
                <div
                  className="dot dot-done"
                  style={{ marginTop: 4, flexShrink: 0 }}
                  aria-hidden
                />
                <div>
                  <div
                    style={{
                      fontSize: 14,
                      color: "var(--text-primary)",
                      lineHeight: 1.5,
                      fontWeight: 500,
                    }}
                  >
                    {title}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--text-hint)",
                      marginTop: 2,
                    }}
                  >
                    {sub}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Links */}
        <div className="about-section">
          <div className="about-section-label">Links</div>
          <div className="about-links-row">
            <a
              href="https://github.com"
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

