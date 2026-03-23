// 1) URL 파라미터에서 id 읽기
// 2) token 을 local storage 에서 읽기
// 3) fetchStoryById 함수 호출로 스토리 데이터 가져오기
// 4) 스토리 데이터를 화면에 렌더링

"use client";

import {
  use,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchStoryById, Story, deleteStoryById } from "@/lib/stories";
import { safeInternalReturnPath } from "@/lib/navigation";
import { getQuestionsForCategories } from "@/constants/interviewQuestions";
import Link from "next/link";
import { StarCompletionVisual } from "@/components/StarCompletionVisual";

function starStatus(story: Story) {
  return {
    situation: !!story.situation?.trim(),
    action: !!story.action?.trim(),
    result: !!story.result?.trim(),
  };
}

const STAR_BLOCKS = [
  {
    label: "Situation & Task",
    sublabel: "Context & goal",
    tip: "Keep it to 2–3 sentences about the context and your specific role or goal.",
    contentKey: "situation" as const,
    empty: "No situation or task provided.",
  },
  {
    label: "Action",
    sublabel: "What you did",
    tip: "Describe 3–5 concrete steps you personally took to move things forward.",
    contentKey: "action" as const,
    empty: "No action provided.",
  },
  {
    label: "Result",
    sublabel: "Impact & learning",
    tip: "Highlight measurable outcomes, impact on others, and what you learned.",
    contentKey: "result" as const,
    empty: "No result provided.",
  },
];

function StoryDetailQuestionsList({
  categories,
  storyId,
}: {
  categories: string[];
  storyId: string;
}) {
  const questions = getQuestionsForCategories(categories);
  const categoriesKey = useMemo(
    () => [...categories].sort().join("\0"),
    [categories],
  );
  const bodyRef = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState(false);
  const [atBottom, setAtBottom] = useState(true);

  const updateScrollHint = useCallback(() => {
    const el = bodyRef.current;
    if (!el) return;
    const hasOverflow = el.scrollHeight > el.clientHeight + 2;
    const isAtBottom =
      !hasOverflow ||
      el.scrollTop + el.clientHeight >= el.scrollHeight - 4;
    setOverflow(hasOverflow);
    setAtBottom(isAtBottom);
  }, []);

  useLayoutEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    updateScrollHint();
    const ro = new ResizeObserver(() => updateScrollHint());
    ro.observe(el);
    el.addEventListener("scroll", updateScrollHint, { passive: true });
    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", updateScrollHint);
    };
  }, [categoriesKey, updateScrollHint]);

  if (questions.length === 0) {
    return (
      <p
        style={{
          fontSize: 14,
          color: "var(--text-muted)",
          lineHeight: 1.6,
        }}
      >
        No interview questions are mapped to this story&apos;s categories yet.
        Add categories like Leadership or Conflict Resolution to see matching
        questions.
      </p>
    );
  }

  const showEdgeHint = overflow && !atBottom;

  return (
    <div
      className={
        showEdgeHint
          ? "story-detail-questions-wrap story-detail-questions-wrap--more"
          : "story-detail-questions-wrap"
      }
    >
      <div
        ref={bodyRef}
        className="story-detail-questions-body"
        role="region"
        aria-label={
          showEdgeHint
            ? "Matching interview questions; more below — scroll the list to view."
            : "Matching interview questions"
        }
      >
        {questions.map((q) => (
          <div
            key={q.id}
            className="q-item"
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              padding: "9px 0",
              borderBottom: "0.5px solid var(--border-card)",
            }}
          >
            <span className="story-detail-q-bullet" aria-hidden />
            <div style={{ flex: 1, minWidth: 0 }}>
              <Link
                className="story-detail-q-link"
                href={`/common-questions?q=${encodeURIComponent(q.id)}&returnTo=${encodeURIComponent(`/stories/${storyId}`)}`}
              >
                <span className="story-detail-q-text">{q.text}</span>
              </Link>
              <div className="chips-row">
                {q.categories.map((cat) => (
                  <span key={cat} className="tag">
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      {showEdgeHint && (
        <div className="story-detail-questions-edge" aria-hidden>
          <span className="story-detail-questions-edge-hint">
            Scroll for more
          </span>
        </div>
      )}
    </div>
  );
}

type StoryDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default function StoryDetailPage({ params }: StoryDetailPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { id: storyId } = use(params);

  const navigateBackFromStoryDetail = () => {
    const dest = safeInternalReturnPath(searchParams.get("returnTo"));
    if (dest) {
      router.push(dest);
    } else {
      router.push("/stories");
    }
  };

  const backFromStoryLabel = safeInternalReturnPath(searchParams.get("returnTo"))
    ? "Back"
    : "Back to Stories";

  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [confirmStep, setConfirmStep] = useState<1 | 2>(1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
      <main className="main-content">
        <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
          Loading story...
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="main-content">
        <div className="error-banner show" role="alert">
          Error: {error}
        </div>
        <button
          type="button"
          className="back-btn"
          style={{ marginTop: 12 }}
          onClick={navigateBackFromStoryDetail}
        >
          <svg
            viewBox="0 0 14 14"
            style={{
              width: 14,
              height: 14,
              fill: "none",
              stroke: "currentColor",
              strokeWidth: 2,
              strokeLinecap: "round",
            }}
            aria-hidden
          >
            <path d="M9 2L4 7l5 5" />
          </svg>
          {backFromStoryLabel}
        </button>
      </main>
    );
  }

  if (!story) {
    return (
      <main className="main-content">
        <div className="card" style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
            Story not found.
          </p>
        </div>
        <button
          type="button"
          className="back-btn"
          onClick={navigateBackFromStoryDetail}
        >
          <svg
            viewBox="0 0 14 14"
            style={{
              width: 14,
              height: 14,
              fill: "none",
              stroke: "currentColor",
              strokeWidth: 2,
              strokeLinecap: "round",
            }}
            aria-hidden
          >
            <path d="M9 2L4 7l5 5" />
          </svg>
          {backFromStoryLabel}
        </button>
      </main>
    );
  }

  const status = starStatus(story);
  return (
    <main className="main-content">
      <div className="topbar">
        <button
          type="button"
          className="back-btn"
          onClick={navigateBackFromStoryDetail}
        >
          <svg
            viewBox="0 0 14 14"
            style={{
              width: 14,
              height: 14,
              fill: "none",
              stroke: "currentColor",
              strokeWidth: 2,
              strokeLinecap: "round",
            }}
            aria-hidden
          >
            <path d="M9 2L4 7l5 5" />
          </svg>
          {backFromStoryLabel}
        </button>
        <div className="btn-group">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => router.push(`/stories/${story.id}/edit`)}
          >
            Edit
          </button>
          <button
            type="button"
            className="btn-warn"
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <h1
          style={{
            fontSize: 21,
            fontWeight: 500,
            color: "var(--text-primary)",
            marginBottom: 8,
            lineHeight: 1.3,
          }}
        >
          {story.title}
        </h1>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
            marginBottom: 12,
          }}
        >
          <span style={{ fontSize: 14, color: "var(--text-hint)" }}>
            Created: {new Date(story.createdAt).toLocaleDateString()}
          </span>
          <StarCompletionVisual
            variant="inline"
            situation={status.situation}
            action={status.action}
            result={status.result}
          />
        </div>
        <div className="chips-row">
          {story.categories.map((c) => (
            <span key={c} className="tag">
              {c}
            </span>
          ))}
        </div>
      </div>

      <div className="detail-grid">
        {/* Left: STAR breakdown */}
        <div className="card">
          <h3
            className="card-title"
            style={{
              marginBottom: 14,
              paddingBottom: 10,
              borderBottom: "0.5px solid var(--border-card)",
            }}
          >
            STAR breakdown
          </h3>
          {STAR_BLOCKS.map((block) => {
            const filled = status[block.contentKey];
            const content = story[block.contentKey];
            return (
              <div
                key={block.label}
                className="star-block"
                aria-invalid={!filled}
              >
                <div className="star-block-header">
                  <span className="star-block-label">{block.label}</span>
                  <span className="star-block-sublabel">{block.sublabel}</span>
                </div>
                <div className="star-tip">{block.tip}</div>
                {filled ? (
                  <div className="star-block-text">{content}</div>
                ) : (
                  <div className="star-block-empty">{block.empty}</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right: Questions */}
        <div className="card" aria-label="Questions this story can answer">
          <h3
            className="card-title"
            style={{
              marginBottom: 14,
              paddingBottom: 10,
              borderBottom: "0.5px solid var(--border-card)",
            }}
          >
            Questions this story can answer
          </h3>
          <StoryDetailQuestionsList
            categories={story.categories}
            storyId={storyId}
          />
        </div>
      </div>

      {showDeleteConfirm && (
        <div
          className="modal-overlay show"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-confirm-title"
        >
          <div className="modal">
            {confirmStep === 1 && !deleting && (
              <>
                <h3 className="modal-title" id="delete-confirm-title">
                  Remove this story from your list?
                </h3>
                <p className="modal-subtitle">
                  You can always create a new story later.
                </p>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setConfirmStep(1);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn-warn"
                    onClick={async () => {
                      if (!story) return;
                      if (confirmStep === 1) {
                        setConfirmStep(2);
                        return;
                      }
                    }}
                  >
                    Remove
                  </button>
                </div>
              </>
            )}

            {confirmStep === 2 && !deleting && (
              <>
                <h3 className="modal-title" id="delete-confirm-title">
                  This cannot be undone. Really delete?
                </h3>
                <p className="modal-subtitle">
                  Deleting this story will also unlink it from any saved questions.
                </p>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setConfirmStep(1);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn-danger"
                    disabled={deleting}
                    onClick={async () => {
                      if (!story) return;
                      try {
                        setDeleting(true);
                        const token = localStorage.getItem("token");
                        if (!token) {
                          throw new Error("No token found. Please log in again.");
                        }
                        await deleteStoryById(token, story.id);
                        router.push("/stories");
                      } catch (err) {
                        alert(
                          err instanceof Error
                            ? err.message
                            : "Failed to delete story."
                        );
                      } finally {
                        setDeleting(false);
                        setShowDeleteConfirm(false);
                        setConfirmStep(1);
                      }
                    }}
                  >
                    Yes, delete
                  </button>
                </div>
              </>
            )}

            {deleting && <p className="modal-deleting">Deleting...</p>}
          </div>
        </div>
      )}
    </main>
  );
}
