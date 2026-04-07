"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signup } from "@/lib/auth";
import { postAuthDestinationFromWindow } from "@/lib/navigation";
import { Button, FormField, Input } from "@/components/ui";

const MIN_PASSWORD_LENGTH = 8;

export default function SignupPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [loginHref, setLoginHref] = useState("/login");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const passwordMatch = !passwordConfirm || password === passwordConfirm;

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const r = params.get("returnTo");
        if (r) {
            setLoginHref(`/login?returnTo=${encodeURIComponent(r)}`);
        }
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (password !== passwordConfirm) {
            setError("Passwords do not match.");
            return;
        }
        if (password.length < MIN_PASSWORD_LENGTH) {
            setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
            return;
        }

        setLoading(true);
        try {
            const data = await signup(email, password);
            localStorage.setItem("token", data.token);
            router.replace(postAuthDestinationFromWindow());
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Signup failed";
            const friendly =
                /already exists|duplicate|taken|registered/i.test(msg)
                    ? "This email is already registered."
                    : msg;
            setError(friendly);
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="auth-page">
            <div className="auth-form-wrap">
                <Link href="/" className="sidebar-logo">
                    StoryBank
                </Link>
                <h1 className="auth-title">Sign up</h1>
                <p className="auth-subtitle">
                    Create an account to access your dashboard and manage STAR stories.
                </p>

                <form onSubmit={handleSubmit} className="auth-form-card auth-form">
                <FormField label="Email" required>
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

                <FormField
                    label="Password"
                    required
                    hint="At least 8 characters recommended"
                >
                    <Input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                        required
                        minLength={MIN_PASSWORD_LENGTH}
                    />
                </FormField>

                <FormField label="Confirm password" required>
                    <Input
                        type="password"
                        placeholder="••••••••"
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                        autoComplete="new-password"
                        required
                        aria-invalid={passwordConfirm.length > 0 && !passwordMatch}
                    />
                    {passwordConfirm.length > 0 && !passwordMatch && (
                        <span className="auth-field-error">Passwords do not match.</span>
                    )}
                </FormField>

                {error && (
                    <p className="auth-error" role="alert">
                        {error}
                    </p>
                )}

                <Button type="submit" variant="primary" disabled={loading} className="auth-submit-btn">
                    {loading ? "Creating account..." : "Create account"}
                </Button>
                </form>

                <p className="muted auth-footer">
                    Already have an account?{" "}
                    <Link href={loginHref} className="auth-link">
                        Log in
                    </Link>
                </p>
            </div>
        </main>
    );
}
                