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
    <main style={{ marginTop: 56 }}>
      <header style={{ maxWidth: 720 }}>
        <h1 style={{ fontSize: 42, fontWeight: 900, margin: 0 }}>
          Prepository
        </h1>

        <p className="muted" style={{ marginTop: 14, fontSize: 18 }}>
          A personal workspace for organizing behavioral interview stories
          using the STAR framework.
        </p>
      </header>

      {/* What this app does */}
      <section className="card" style={{ marginTop: 36, maxWidth: 720 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>
          What you can do
        </h2>

        <ul className="muted" style={{ marginTop: 12, paddingLeft: 18 }}>
          <li>Create and save behavioral interview stories</li>
          <li>Structure answers using the STAR framework</li>
          <li>Edit and refine responses over time</li>
          <li>Securely manage your own data with login</li>
        </ul>
      </section>

      {/* Demo & Access */}
      <section className="card" style={{ marginTop: 16, maxWidth: 720 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>
          Demo & Access
        </h2>

        <p className="muted" style={{ marginTop: 10 }}>
          This is a demo project built for learning and portfolio purposes.
        </p>

        <p className="muted" style={{ marginTop: 6 }}>
          User accounts are created via the backend API
          (<code>/auth/signup</code>).
        </p>
      </section>

      {/* Action */}
      <div style={{ marginTop: 36, display: "flex", gap: 12, flexWrap: "wrap" }}>
        {hasToken ? (
          <button className="btn btn-primary"
            onClick={() => router.push("/dashboard")}
          >
            Go to Dashboard
          </button>
        ) : (
          <>
            <button className="btn btn-primary"
              onClick={() => router.push("/login")}
            >
              Log In to Continue
            </button>

            <button className="btn btn-primary"
              onClick={() => router.push("/signup")}
            >
              Sign Up
            </button> 
          </>
        )}
      </div>
    </main>
  );
}