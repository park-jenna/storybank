"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signup } from "@/lib/auth";

export default function SignupPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form 제출 핸들러
    async function handleSubmit (e: React.FormEvent) {
        // 브라우저의 기본동작(새로고침) 방지
        e.preventDefault();

        setError(null);
        setLoading(true);

        try {
            // signup API 호출
            const data = await signup(email, password);  // return {user, token}
            // 1) 토큰을 로컬 스토리지에 저장
            localStorage.setItem("token", data.token);
            // 2) redirect
            router.replace("/dashboard");
        } catch (error) {
            const msg = error instanceof Error ? error.message : "Signup failed";
            setError(msg);
        } finally {
            setLoading(false);
        }
    }

    return (
        <main style={{ marginTop: 64 }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, margin: 0 }}>Sign up</h1>
        <p className="muted" style={{ marginTop: 10 }}>
            Create an account to access your dashboard and manage STAR stories.
        </p>

        <form
            onSubmit={handleSubmit}
            className="card"
            style={{ marginTop: 20, display: "grid", gap: 12, maxWidth: 420 }}
        >
            <label style={{ display: "grid", gap: 6 }}>
            <span>Email</span>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
                <span>Password</span>
                <input
                    type="password"
                    placeholder=""
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </label>

            {error && (
                <p style={{ color: "crimson", margin: 0 }}>{error}</p>
            )}

            <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Account"}
            </button>

            <p className="muted" style={{ margin: 0, fontSize: 14 }}>
                Already have an account?{" "}
                <a href="/login">Log in</a>
            </p>
        </form>
        </main>
    );
}
                