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
import { CATEGORIES } from "@/constants/categories";
import { Button, Card, FormField, Input, Textarea } from "@/components/ui";

export default function EditStoryPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const storyId = params?.id;

  const [story, setStory] = useState<Story | null>(null);
  const [title, setTitle] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [situation, setSituation] = useState("");
  const [action, setAction] = useState("");
  const [result, setResult] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setError(null);
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No token found. Please log in again.");
          router.replace("/login");
          return;
        }
        if (!storyId) {
          setError("No story ID provided.");
          return;
        }
        const data = await fetchStoryById(token, storyId);
        setStory(data.story);
        setTitle(data.story.title ?? "");
        setSelectedCategories(data.story.categories ?? []);
        setSituation(data.story.situation ?? "");
        setAction(data.story.action ?? "");
        setResult(data.story.result ?? "");
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Failed to load story.";
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
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found. Please log in again.");
      if (!storyId) throw new Error("No story ID provided.");

      const cleanTitle = title.trim();
      if (!cleanTitle) throw new Error("Title is required.");
      if (selectedCategories.length === 0) {
        throw new Error("At least one category is required.");
      }

      await updateStoryById(token, storyId, {
        title: cleanTitle,
        categories: selectedCategories,
        situation: situation.trim(),
        action: action.trim(),
        result: result.trim(),
      });
      router.push(`/stories/${storyId}`);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to update story.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  function toggleCategory(category: string, checked: boolean) {
    setSelectedCategories((prev) =>
      checked ? [...prev, category] : prev.filter((c) => c !== category)
    );
  }

  if (loading) {
    return (
      <main className="page-section">
        <p className="muted">Loading story...</p>
      </main>
    );
  }

  if (error && !story) {
    return (
      <main className="page-section">
        <Card variant="error">
          <p className="form-error">Error: {error}</p>
        </Card>
        <div className="mt-4">
          <Button onClick={() => router.push("/stories")}>
            ← Back to Stories
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="page-section">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="story-form-title">Edit Story</h1>
          {story && (
            <p className="muted mt-2 mb-0">
              Editing: <strong>{story.title}</strong>
            </p>
          )}
        </div>
        <Button
          type="button"
          onClick={() => router.push(`/stories/${storyId}`)}
        >
          ← Back
        </Button>
      </header>

      <form onSubmit={handleSave} className="story-form-card">
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

        <FormField label="Situation / Task">
          <Textarea
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            placeholder="What was the context?"
            rows={3}
          />
        </FormField>

        <FormField label="Action">
          <Textarea
            value={action}
            onChange={(e) => setAction(e.target.value)}
            placeholder="What did you do?"
            rows={3}
          />
        </FormField>

        <FormField label="Result">
          <Textarea
            value={result}
            onChange={(e) => setResult(e.target.value)}
            placeholder="What was the outcome?"
            rows={3}
          />
        </FormField>

        {error && (
          <p className="form-error" role="alert">
            Error: {error}
          </p>
        )}

        <div className="story-form-actions">
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
          <Button
            type="button"
            onClick={() => router.push(`/stories/${storyId}`)}
            disabled={saving}
          >
            Cancel
          </Button>
        </div>

      </form>
    </main>
  );
}
