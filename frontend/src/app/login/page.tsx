"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth";
import { Button, FormField, Input } from "@/components/ui";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const data = await login(email, password);
            localStorage.setItem("token", data.token);
            router.replace("/dashboard");
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Login failed";
            // Map backend auth errors to a clear user-facing message
            const friendly =
                /invalid|incorrect|wrong|unauthorized|401/i.test(msg)
                    ? "Invalid email or password."
                    : msg;
            setError(friendly);
        } finally {
            setLoading(false);
        }
    }

    return (
    <main className="auth-page">
      <div className="auth-shell">
        <section className="auth-hero">
          <Link href="/" className="sidebar-logo">
            StoryBank
          </Link>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">
            Log in to continue crafting clear, memorable STAR stories for your next interview.
          </p>

          <ul className="auth-bullets">
            <li>See your stories at a glance on the dashboard</li>
            <li>Track which stories still need Situation / Action / Result</li>
            <li>Link stories to common interview questions</li>
          </ul>
        </section>

        <section className="auth-panel" aria-label="Log in to StoryBank">
          <div className="auth-form-card">
            <h2 className="auth-panel-title">Log in</h2>
            <p className="auth-panel-subtitle">
              Enter your email and password to access your workspace.
            </p>

            <form onSubmit={handleSubmit} className="auth-form">
              <FormField label="Email">
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  autoFocus
                />
              </FormField>

              <FormField label="Password">
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </FormField>

              {error && (
                <p className="auth-error" role="alert">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="auth-submit-btn"
              >
                {loading ? "Logging in..." : "Log in"}
              </Button>
            </form>

            <p className="auth-footer">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="auth-link">
                Sign up
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
    );
}