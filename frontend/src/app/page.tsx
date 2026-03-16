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
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "2rem",
        background: "var(--bg-page)",
        textAlign: "center",
      }}
    >
      {/* Hero */}
      <div style={{ marginBottom: "2rem" }}>
        <h1
          style={{
            fontSize: 36,
            fontWeight: 500,
            color: "var(--text-primary)",
            marginBottom: 10,
            lineHeight: 1.2,
          }}
        >
          StoryBank
        </h1>
        <p
          style={{
            fontSize: 15,
            color: "var(--text-muted)",
            lineHeight: 1.6,
            maxWidth: 360,
            margin: "0 auto",
          }}
        >
          Save and organize stories for interviews
        </p>
      </div>

      {/* CTA buttons */}
      <div
        style={{
          display: "flex",
          gap: 10,
          justifyContent: "center",
          marginBottom: "2.5rem",
        }}
      >
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

      {/* Features */}
      <div
        style={{
          background: "var(--bg-card)",
          border: "0.5px solid var(--border-card)",
          borderRadius: "var(--radius-lg)",
          padding: "1.25rem 1.5rem",
          maxWidth: 360,
          width: "100%",
          textAlign: "left",
          marginBottom: "2rem",
        }}
      >
        {[
          "Create and save behavioral interview stories",
          "Edit and refine responses over time",
          "Securely manage your own data with login",
        ].map((item) => (
          <div
            key={item}
            className="feature-item"
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              padding: "7px 0",
              borderBottom: "0.5px solid var(--border-card)",
              fontSize: 13,
              color: "var(--text-secondary)",
              lineHeight: 1.5,
            }}
          >
            <div
              className="dot dot-done"
              style={{ marginTop: 4, flexShrink: 0 }}
              aria-hidden
            />
            {item}
          </div>
        ))}
        <style>{`.feature-item:last-child { border-bottom: none !important; }`}</style>
      </div>

      {/* Footer note */}
      <p style={{ fontSize: 11, color: "var(--text-faint)" }}>
        Demo project built for learning and portfolio purposes
      </p>
    </main>
  );
}
