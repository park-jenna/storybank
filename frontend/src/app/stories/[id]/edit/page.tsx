// frontend/src/app/stories/[id]/edit/page.tsx
// 1) URL 파라미터에서 id 읽기
// 2) token 을 local storage 에서 읽기
// 3) fetchStoryById(token, id) 함수 호출로 기존 스토리 데이터 가져오기
// 4) 폼 UI 에 기존 스토리 데이터 채워서 표시(prefill)
// 5) 사용자가 수정 후 제출 시 API 호출 (updateStoryById(token, id, input))
// 6) 수정 완료 후 스토리 상세 페이지로(/stories/:id) 리다이렉트, 실패시 에러 표시

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchStoryById, Story, updateStoryById } from "@/lib/stories";

export default function EditStoryPage() {
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const storyId = params?.id;

    // original story data
    const [story, setStory] = useState<Story | null>(null);

    // form state 
    const [title, setTitle] = useState("");
    const [categoriesText, setCategoriesText] = useState("");
    const [situation, setSituation] = useState("");
    const [action, setAction] = useState("");
    const [result, setResult] = useState("");

    // UX state
    const [loading, setLoading] = useState(true); // for initial data load
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 1) page load 시 기존 스토리 데이터 가져와서 form prefill
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

                // 3) fetchStoryById 함수 호출로 기존 스토리 데이터 가져오기
                const data = await fetchStoryById(token, storyId);
                setStory(data.story); // 원본 저장

                // 4) 폼 UI 에 기존 스토리 데이터 채워서 표시(prefill)
                setTitle(data.story.title ?? "");
                setCategoriesText((data.story.categories ?? []).join(", "));
                setSituation(data.story.situation ?? "");
                setAction(data.story.action ?? "");
                setResult(data.story.result ?? "");
            } catch (err) {
                const msg = err instanceof Error ? err.message : "Failed to load story.";
                setError(msg);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [storyId, router]);

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        
        setError(null);
        setSaving(true);

        try {
            // 1) token 을 local storage 에서 읽기
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("No token found. Please log in again.");
            }
            if (!storyId) {
                throw new Error("No story ID provided.");
            }

            const cleanTitle = title.trim();
            if (!cleanTitle) {
                throw new Error("Title is required.");
            }

            const categories = categoriesText
                .split(",")
                .map((cat) => cat.trim())
                .filter(Boolean);

            if (categories.length === 0) {
                throw new Error("At least one category is required.");
            }

            // 2) updateStoryById 함수 호출로 스토리 수정 요청 
            await updateStoryById(token, storyId, {
                title: cleanTitle,
                categories,
                situation: situation.trim(),
                action: action.trim(),
                result: result.trim(),
            });

            // 3) 수정 완료 후 스토리 상세 페이지로 리다이렉트
            router.push(`/stories/${storyId}`);
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Failed to update story.";
            setError(msg);
        } finally {
            setSaving(false);
        }
    }

    // loading
    if (loading) {
        return (
            <main style={{ marginTop: 32 }}>
                <p className="muted">Loading story...</p>
            </main>
        );
    }

    // error
    if (error && !story) {
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
    // form
    return (
        <main style={{ marginTop: 32 }}>
            <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
                <div>
                    <h1 style={{ fontSize: 32, fontWeight: 900, margin: 0 }}>Edit Story</h1>
                    {story && (
                        <p className="muted" style={{ marginTop: 8, marginBottom: 0 }}>
                            Editing: <strong>{story.title}</strong>
                        </p>
                    )}
                </div>

                <button className="btn" type="button" onClick={() => router.push(`/stories/${storyId}`)}>
                    ← Back
                </button>
            </header>

            <form
                onSubmit={handleSave}
                className="card"
                style={{ marginTop: 20, display: "grid", gap: 14, maxWidth: 720 }}
            >
                {/* Title */}
                <label style={{ display: "grid", gap: 6 }}>
                    <span style={{ fontWeight: 700 }}>Title *</span>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="E.g., Leading a team project"
                        required
                    />
                </label>

                {/* Categories */}
                <label style={{ display: "grid", gap: 6 }}>
                    <span style={{ fontWeight: 700 }}>Categories * (comma-separated)</span>
                    <input
                        value={categoriesText}
                        onChange={(e) => setCategoriesText(e.target.value)}
                        placeholder="E.g., Leadership, Conflict"
                    />
                </label>

                {/* Situation */}
                <label style={{ display: "grid", gap: 6 }}>
                    <span style={{ fontWeight: 700 }}>Situation</span>
                    <textarea
                        value={situation}
                        onChange={(e) => setSituation(e.target.value)}
                        placeholder="What was the context?"
                        rows={3}
                    />
                </label>

                {/* Action */}
                <label style={{ display: "grid", gap: 6 }}>
                    <span style={{ fontWeight: 700 }}>Action</span>
                    <textarea
                        value={action}
                        onChange={(e) => setAction(e.target.value)}
                        placeholder="What did you do?"
                        rows={3}
                    />
                </label>

                {/* Result */}
                <label style={{ display: "grid", gap: 6 }}>
                    <span style={{ fontWeight: 700 }}>Result</span>
                    <textarea
                        value={result}
                        onChange={(e) => setResult(e.target.value)}
                        placeholder="What was the outcome?"
                        rows={3}
                    />
                </label>

                {error && <p style={{ color: "crimson", margin: 0 }}>Error: {error}</p>}

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 4 }}>
                    <button className="btn btn-primary" type="submit" disabled={saving}>
                        {saving ? "Saving..." : "Save Changes"}
                    </button>

                    <button
                        className="btn"
                        type="button"
                        onClick={() => router.push(`/stories/${storyId}`)}
                        disabled={saving}
                    >
                        Cancel
                    </button>
                </div>

                <p className="muted" style={{ margin: 0, fontSize: 13 }}>
                    Tip: Use commas in Categories to add multiple tags (e.g., <code>Leadership, Conflict</code>).
                </p>
            </form>
        </main>
    );
}