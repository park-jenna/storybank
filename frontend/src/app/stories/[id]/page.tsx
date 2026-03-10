// 1) URL 파라미터에서 id 읽기
// 2) token 을 local storage 에서 읽기
// 3) fetchStoryById 함수 호출로 스토리 데이터 가져오기
// 4) 스토리 데이터를 화면에 렌더링

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchStoryById, Story, deleteStoryById } from "@/lib/stories";
import { getBadgeClass } from "@/constants/categories";
import { Button } from "@/components/ui";

function storyCompletion(story: Story) {
  let filled = 0;
  if (story.situation?.trim()) filled++;
  if (story.action?.trim()) filled++;
  if (story.result?.trim()) filled++;
  const percent = Math.round((filled / 3) * 100);
  return { filled, percent };
}

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
      <main className="page-section">
        <p className="muted">Loading story...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="page-section">
        <div className="card" style={{ borderColor: "rgba(220, 38, 38, 0.35)" }}>
          <p style={{ color: "crimson", margin: 0 }}>Error: {error}</p>
        </div>

        <div style={{ marginTop: 14 }}>
          <Button onClick={() => router.push("/stories")}>← Back to Stories</Button>
        </div>
      </main>
    );
  }

  if (!story) {
    return (
      <main className="page-section">
        <div className="card">
          <p style={{ margin: 0 }}>Story not found.</p>
        </div>

        <div style={{ marginTop: 14 }}>
          <Button onClick={() => router.push("/stories")}>← Back to Stories</Button>
        </div>
      </main>
    );
  }

  const { filled, percent } = storyCompletion(story);

  return (
    <main className="page-section">
      <header className="story-detail-header">
        <div className="story-detail-header-top">
          <Button onClick={() => router.push("/stories")}>← Back to Stories</Button>

          <div className="story-detail-actions">
            <Button onClick={() => router.push(`/stories/${story.id}/edit`)}>Edit</Button>

            <Button
              variant="danger"
              onClick={async () => {
                const ok = confirm("Are you sure you want to delete this story?");
                if (!ok) return;

                try {
                  const token = localStorage.getItem("token");
                  if (!token) throw new Error("No token found. Please log in again.");

                  await deleteStoryById(token, story.id);
                  router.push("/stories");
                } catch (err) {
                  alert(err instanceof Error ? err.message : "Failed to delete story.");
                }
              }}
            >
              Delete
            </Button>
          </div>
        </div>

        <h1 className="story-detail-title">{story.title}</h1>

        <div className="story-detail-meta">
          <div className="story-detail-meta-top">
            <p className="muted story-detail-date">
              Created: {new Date(story.createdAt).toLocaleDateString()}
            </p>
            <span className="story-detail-progress-text">
              Completion: {filled}/3 sections ({percent}%)
            </span>
          </div>

          <div className="story-detail-progress-bar">
            <div
              className="story-detail-progress-fill"
              style={{ width: `${percent}%` }}
            />
          </div>

          <div className="story-detail-categories">
            {story.categories.map((c) => (
              <span key={c} className={`badge ${getBadgeClass(c)}`}>
                {c}
              </span>
            ))}
          </div>
        </div>
      </header>

      <h2 className="page-section-title" style={{ marginTop: 28, marginBottom: 12 }}>
        STAR breakdown
      </h2>

      <section className="story-detail-star">
        <div className="story-detail-star-grid">
          {/* Situation & Task */}
          <div className="story-detail-star-card">
            <div className="story-detail-star-label-row">
              <div className="story-detail-star-label">1. Situation &amp; Task</div>
              <span className="story-detail-step">Context &amp; goal</span>
            </div>
            <div className="story-detail-tip">
              <div className="story-detail-tip-icon">💡</div>
              <p className="story-detail-tip-text">
                Keep it to 2–3 sentences about the context and your specific role or goal.
              </p>
            </div>
            <p className="muted story-detail-star-text">
              {story.situation || "No situation or task provided."}
            </p>
          </div>

          {/* Action */}
          <div className="story-detail-star-card">
            <div className="story-detail-star-label-row">
              <div className="story-detail-star-label">2. Action</div>
              <span className="story-detail-step">What you did</span>
            </div>
            <div className="story-detail-tip">
              <div className="story-detail-tip-icon">💡</div>
              <p className="story-detail-tip-text">
                Describe 3–5 concrete steps you personally took to move things forward.
              </p>
            </div>
            <p className="muted story-detail-star-text">
              {story.action || "No action provided."}
            </p>
          </div>

          {/* Result */}
          <div className="story-detail-star-card">
            <div className="story-detail-star-label-row">
              <div className="story-detail-star-label">3. Result</div>
              <span className="story-detail-step">Impact &amp; learning</span>
            </div>
            <div className="story-detail-tip">
              <div className="story-detail-tip-icon">💡</div>
              <p className="story-detail-tip-text">
                Highlight measurable outcomes, impact on others, and what you learned.
              </p>
            </div>
            <p className="muted story-detail-star-text">
              {story.result || "No result provided."}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
