"use client";

import { useState } from "react";
import { login } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    // Form 제출 핸들러
    async function handleSubmit (e: React.FormEvent) {
        // 브라우저의 기본동작(새로고침) 방지
        e.preventDefault();

        // you handle the login logic here
        setError(null);
        setSuccessMsg(null);
        setLoading(true);

        try {
            // 로그인 API 호출
            // 성공하면 {user, token} 형태의 응답을 받음
            const data = await login(email, password);  // {user, token}

            // 1) 토큰을 로컬 스토리지에 저장
            localStorage.setItem("token", data.token);
            // 2) redirect
            router.replace("/dashboard");

            //setSuccessMsg(`Logged in as ${data.user.email}`);
            //console.log("Login successful:", data);
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Login failed";
            setError(msg);
        } finally {
            setLoading(false);
        }
    }



  return (
    <main style={{ marginTop: 64 }}>
      <h1 style={{ fontSize: 32, fontWeight: 900, margin: 0 }}>Log in</h1>
      <p className="muted" style={{ marginTop: 10 }}>
        Access your dashboard to create and manage STAR stories.
      </p>

      <form
        onSubmit={handleSubmit}
        className="card"
        style={{ marginTop: 20, display: "grid", gap: 12, maxWidth: 420 }}
      >
        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontWeight: 700 }}>Email</span>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontWeight: 700 }}>Password</span>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {error && <p style={{ color: "crimson", margin: 0 }}>{error}</p>}
        {successMsg && <p style={{ color: "green", margin: 0 }}>{successMsg}</p>}

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>

      <div style={{ marginTop: 14, maxWidth: 420 }}>
        <p className="muted" style={{ margin: 0, fontSize: 14 }}>
          Demo note: accounts are created via the backend <code>/auth/signup</code> API.
        </p>
      </div>
    </main>
  );
}