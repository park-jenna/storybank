// frontend/src/app/stories/new/page.tsx
// 1) 사용자가 입력할 폼 UI
// 2) 입력값을 React state 로 관리
// 3) 제출 시 API 호출 (스토리 생성)
//      - createStory(token, input) 호출로 서버에 새 스토리 생성 요청
// 4) 생성 완료 후 대시보드로 리다이렉트, 실패시 에러 표시

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createStory } from "@/lib/stories";
import { CATEGORIES } from "@/constants/categories";
import { Button, FormField, Input, Textarea } from "@/components/ui";

export default function NewStoryPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [situation, setSituation] = useState("");
  const [action, setAction] = useState("");
  const [result, setResult] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleCategory(category: string, checked: boolean) {
    setSelectedCategories((prev) =>
      checked ? [...prev, category] : prev.filter((c) => c !== category)
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found. Please log in again.");
      }

      const cleanTitle = title.trim();
      if (!cleanTitle) throw new Error("Title is required.");
      if (selectedCategories.length === 0) {
        throw new Error("At least one category is required.");
      }

      await createStory(token, {
        title: cleanTitle,
        categories: selectedCategories,
        situation: situation.trim(),
        action: action.trim(),
        result: result.trim(),
      });
      router.push("/dashboard");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to create story.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-section">
      <header className="story-form-header">
        <h1 className="story-form-title">New Story</h1>
        <p className="story-form-subtitle">
          Create a new behavioral interview story. Select one or more
          categories that best describe your story.
        </p>
      </header>

      <div className="story-form-layout">
        <div className="story-form-main">
          <form onSubmit={handleSubmit} className="story-form-card">
        <section className="story-form-section">
          <FormField label="Title" required>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="E.g., Leading a team project"
              required
            />
          </FormField>

          <FormField
            label="Categories"
            required
            hint="Select one or more categories that best describe your story."
          >
            <div className="story-form-chips">
              {CATEGORIES.map((category) => {
                const selected = selectedCategories.includes(category);
                return (
                  <label
                    key={category}
                    className={`chip story-form-chip ${selected ? "chip-selected" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={(e) =>
                        toggleCategory(category, e.target.checked)
                      }
                      className="sr-only"
                    />
                    {category}
                  </label>
                );
              })}
            </div>
          </FormField>
        </section>

        <section className="story-form-section story-form-section-star">
          <h2 className="story-form-section-title">
            <span className="story-form-section-title-icon" aria-hidden>✦</span>
            STAR breakdown
          </h2>
          <div className="story-form-star-step" data-step="1">
            <FormField label="Situation & Task">
              <Textarea
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
                placeholder="What was the context? What was your goal or role?"
                rows={3}
              />
            </FormField>
          </div>
          <div className="story-form-star-step" data-step="2">
            <FormField label="Action">
              <Textarea
                value={action}
                onChange={(e) => setAction(e.target.value)}
                placeholder="What did you do? Describe concrete steps."
                rows={3}
              />
            </FormField>
          </div>
          <div className="story-form-star-step" data-step="3">
            <FormField label="Result">
              <Textarea
                value={result}
                onChange={(e) => setResult(e.target.value)}
                placeholder="What was the outcome? What did you learn?"
                rows={3}
              />
            </FormField>
          </div>
        </section>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <div className="story-form-actions">
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Saving..." : "Create Story"}
          </Button>
          <Button
            type="button"
            onClick={() => router.push("/stories")}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>

        <p className="story-form-tip">
          After creating the story, you can edit and refine it from the
          dashboard.
        </p>
      </form>
        </div>

        <aside className="story-form-tips" aria-label="STAR method tips">
          <h3 className="story-form-tips-title">STAR writing tips</h3>
          <div className="story-form-tips-list">
            <div className="story-form-tips-item">
              <span className="story-form-tips-num">1</span>
              <div>
                <strong>Situation & Task</strong>
                <p>Describe the context and your goal in 2–3 sentences. Be clear about your role and what needed to be achieved.</p>
              </div>
            </div>
            <div className="story-form-tips-item">
              <span className="story-form-tips-num">2</span>
              <div>
                <strong>Action</strong>
                <p>Outline 3–5 concrete steps you took. Focus on what you said and did, not the team.</p>
              </div>
            </div>
            <div className="story-form-tips-item">
              <span className="story-form-tips-num">3</span>
              <div>
                <strong>Result</strong>
                <p>Keep it short: outcomes, numbers, and what you learned. e.g. “Improved X by 20% and learned Y.”</p>
              </div>
            </div>
          </div>
          <p className="story-form-tips-footer">
            Summarize so you can tell this story in 1–2 minutes in an interview.
          </p>
        </aside>
      </div>
    </main>
  );
}
