// 1) URL 파라미터에서 id 읽기
// 2) token 을 local storage 에서 읽기
// 3) fetchStoryById 함수 호출로 스토리 데이터 가져오기
// 4) 스토리 데이터를 화면에 렌더링

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchStoryById, Story, deleteStoryById } from "@/lib/stories";

export default function StoryDetailPage() {
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const storyId = params?.id;

    const [story, setStory] = useState<Story | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            try {
                setError(null);

                // 2) token 을 local storage 에서 읽기
                const token = localStorage.getItem("token");
                if (!token) {
                    setError("No token found. Please log in again.");
                    router.replace("/login");
                    return;
                }

                // id 확인
                if (!storyId) {
                    setError("No story ID provided.");
                    return;
                }

                // 3) fetchStoryById 함수 호출로 스토리 데이터 가져오기
                const data = await fetchStoryById(token, storyId);
                setStory(data.story);
            } catch (err) {
                const msg = err instanceof Error ? err.message : "Failed to load story.";
                setError(msg);
            } finally {
                setLoading(false);
            }
        }
        
        load();
    }, [storyId, router]);

    if (loading) {
        return (
            <main style={{ marginTop: 32 }}>
                <p className="muted">Loading story...</p>
            </main>
        );
    }

    if (error) {
        return (
            <main style={{ marginTop: 32 }}>
                <div className="card" style={{ borderColor: "rgba(220, 38, 38, 0.35)" }}>
                    <p style={{ color: "crimson", margin: 0 }}>Error: {error}</p>
                </div>

                <div style={{ marginTop: 14 }}>
                    <button className="btn" onClick={() => router.push("/dashboard")}>
                        ← Back to Dashboard
                    </button>
                </div>
            </main>
        );
    }

    if (!story) {
        return (
            <main style={{ marginTop: 32 }}>
                <div className="card">
                    <p style={{ margin: 0 }}>Story not found.</p>
                </div>

                <div style={{ marginTop: 14 }}>
                    <button className="btn" onClick={() => router.push("/dashboard")}>
                        ← Back to Dashboard
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main style={{ marginTop: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                <button className="btn" onClick={() => router.push("/dashboard")}>
                    ← Back to Dashboard
                </button>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button
                        className="btn"
                        onClick={() => router.push(`/stories/${story.id}/edit`)}
                    >
                        Edit
                    </button>

                    <button
                        className="btn btn-danger"
                        onClick={async () => {
                            const ok = confirm("Are you sure you want to delete this story?");
                            if (!ok) return;

                            try {
                                const token = localStorage.getItem("token");
                                if (!token) throw new Error("No token found. Please log in again.");

                                await deleteStoryById(token, story.id);
                                router.push("/dashboard");
                            } catch (err) {
                                alert(err instanceof Error ? err.message : "Failed to delete story.");
                            }
                        }}
                    >
                        Delete
                    </button>
                </div>
            </div>

            <header style={{ marginTop: 22 }}>
                <h1 style={{ fontSize: 32, fontWeight: 900, margin: 0 }}>{story.title}</h1>

                <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {story.categories.map((c) => (
                        <span key={c} className="badge">
                            {c}
                        </span>
                    ))}
                </div>

                <p className="muted" style={{ marginTop: 10, marginBottom: 0, fontSize: 14 }}>
                    Created: {new Date(story.createdAt).toLocaleDateString()}
                </p>
            </header>

            <section style={{ marginTop: 18, display: "grid", gap: 12 }}>
                <div className="card">
                    <div style={{ fontWeight: 800 }}>Situation</div>
                    <p className="muted" style={{ marginTop: 8, marginBottom: 0, whiteSpace: "pre-wrap" }}>
                        {story.situation || "No situation provided."}
                    </p>
                </div>

                <div className="card">
                    <div style={{ fontWeight: 800 }}>Action</div>
                    <p className="muted" style={{ marginTop: 8, marginBottom: 0, whiteSpace: "pre-wrap" }}>
                        {story.action || "No action provided."}
                    </p>
                </div>

                <div className="card">
                    <div style={{ fontWeight: 800 }}>Result</div>
                    <p className="muted" style={{ marginTop: 8, marginBottom: 0, whiteSpace: "pre-wrap" }}>
                        {story.result || "No result provided."}
                    </p>
                </div>
            </section>
        </main>
    );
} 
    