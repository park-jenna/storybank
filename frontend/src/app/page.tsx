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
    <main style={{ marginTop: 80, maxWidth: 640, margin: "80px auto 0" }}>
      {/* Hero Section */}
      <header style={{ textAlign: "center", marginBottom: 48 }}>
        <h1 style={{ fontSize: 48, fontWeight: 900, margin: 0 }}>
          StoryBank
        </h1>
        <p className="muted" style={{ marginTop: 16, fontSize: 20 }}>
          Save and organize stories for interviews
        </p>
      </header>

      {/* CTA Buttons */}
      <div style={{ 
        display: "flex", 
        flexDirection: "column",
        gap: 12, 
        maxWidth: 360,
        margin: "0 auto 64px"
      }}>
        {hasToken ? (
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={() => router.push("/dashboard")}
          >
            Go to Dashboard
          </Button>
        ) : (
          <>
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => router.push("/login")}
            >
              Log In
            </Button>
            <Button
              size="lg"
              className="w-full"
              onClick={() => router.push("/signup")}
            >
              Sign Up
            </Button>
          </>
        )}
      </div>

      {/* Features */}
      <div style={{ 
        borderTop: "1px solid var(--border)",
        paddingTop: 32
      }}>
        <ul style={{ 
          listStyle: "none", 
          padding: 0,
          display: "flex",
          flexDirection: "column",
          gap: 12
        }}>
          <li className="muted" style={{ fontSize: 16 }}>
            • Create and save behavioral interview stories
          </li>
          <li className="muted" style={{ fontSize: 16 }}>
            • Edit and refine responses over time
          </li>
          <li className="muted" style={{ fontSize: 16 }}>
            • Securely manage your own data with login
          </li>
        </ul>
      </div>

      {/* Footer Note */}
      <div style={{ 
        marginTop: 48,
        paddingTop: 32,
        borderTop: "1px solid var(--border)"
      }}>
        <p className="muted" style={{ textAlign: "center", fontSize: 14 }}>
          Demo project built for learning and portfolio purposes
        </p>
      </div>
    </main>
  );
}