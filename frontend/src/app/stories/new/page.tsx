// frontend/src/app/stories/new/page.tsx
// 1) 사용자가 입력할 폼 UI
// 2) 입력값을 React state 로 관리
// 3) 제출 시 API 호출 (스토리 생성) 
//      - createStory(token, input) 호출로 서버에 새 스토리 생성 요청
// 4) 생성 완료 후 대시보드로 리다이렉트, 실패시 에러 표시

"use client";

import React, { useState } from "react";
import { useRouter } from 'next/navigation';        
import { createStory } from '@/lib/stories';
import { CATEGORIES } from "@/constants/categories";

export default function NewStoryPage() {
    const router = useRouter();

    // 폼 입력값을 위한 state
    const [title, setTitle] = useState("");
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [situation, setSituation] = useState("");
    const [action, setAction] = useState("");
    const [result, setResult] = useState("");

    // 로딩/에러 상태 관리
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function toggleCategory(category: string, checked: boolean) {
        setSelectedCategories((prev) => {
            return checked ? [...prev, category] : prev.filter((c) => c !== category);
        });
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        setError(null);
        setLoading(true);

        try {
            // 1) token 을 local storage 에서 읽기
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("No token found. Please log in again.");
            }

            // 2) 최소 겅증: title, categories 입력값 확인
            const cleanTitle = title.trim();
            if (!cleanTitle) {
                throw new Error("Title is required.");
            }

            // 3) categories 선택 확인
            const categories = selectedCategories;
            if (categories.length === 0) {
                throw new Error("At least one category is required.");
            }

            // 4) API 호출을 위한 입력 객체 생성
            const input = {
                title: cleanTitle,
                categories,
                situation: situation.trim(),
                action: action.trim(),
                result: result.trim(),
            };

            // 5) createStory 함수 호출로 새 스토리 생성 요청
            await createStory(token, input);

            // 6) 생성 성공 시 대시보드로 리다이렉트
            router.push("/dashboard");
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Failed to create story.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    }

    return (
        <main style={{ marginTop: 32 }}>
            <header>
                <h1 style={{ fontSize: 32, fontWeight: 900, margin: 0 }}>New Story</h1>
                <p className="muted" style={{ marginTop: 10, marginBottom: 0 }}>
                    Create a new behavioral interview story. Select one or more categories that best describe your story.
                </p>
            </header>

            <form
                onSubmit={handleSubmit}
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
                <div style={{ display: "grid", gap: 6 }}>
                    <span style={{ fontWeight: 700 }}>Categories *</span>

                    <div style={{ display:"flex", flexWrap: "wrap", gap: 12 }}>
                        {CATEGORIES.map((category) => {
                            const selected = selectedCategories.includes(category);

                            return (
                                <label 
                                    key={category} 
                                    className={`chip ${selected ? "chip-selected" : ""}`}
                                    style={{ cursor: "pointer" }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selected}
                                        onChange={(e) => toggleCategory(category, e.target.checked)}
                                        style={{ display: "none" }}
                                    />
                                    {category}
                                </label>
                            );
                        })}
                    </div>

                    <p className="muted" style={{ margin: 0, fontSize: 13 }}>
                        Select one or more categories that best describe your story.
                    </p>
                </div>

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

                {/* Error Message */}
                {error && <p style={{ color: "crimson", margin: 0 }}>{error}</p>}

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 4 }}>
                    <button className="btn btn-primary" type="submit" disabled={loading}>
                        {loading ? "Saving..." : "Create Story"}
                    </button>

                    <button
                        className="btn"
                        type="button"
                        onClick={() => router.push("/dashboard")}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                </div>

                <p className="muted" style={{ margin: 0, fontSize: 13 }}>
                    Tip: After creating the story, you can further edit and enhance it in the dashboard.
                </p>
            </form>
        </main>
    );
}  