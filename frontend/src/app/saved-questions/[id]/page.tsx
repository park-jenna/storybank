"use client";

import { use, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { SavedQuestionManageForm } from "@/components/SavedQuestionManageForm";
import { fetchUserQuestionById, deleteUserQuestion, UserQuestionItem } from "@/lib/user-questions";

const MAX_STORY_TAGS_ON_SLIDE = 3;

function orderedStoryCategories(categories: string[], recommended: string[]): string[] {
  const rec = new Set(recommended);
  const matches = categories.filter((c) => rec.has(c));
  const rest = categories.filter((c) => !rec.has(c));
  return [...matches, ...rest];
}

type SavedQuestionDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default function SavedQuestionDetailPage({
  params,
}: SavedQuestionDetailPageProps) {
  const router = useRouter();
  const { id: questionId } = use(params);

  const [userQuestion, setUserQuestion] = useState<UserQuestionItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [confirmStep, setConfirmStep] = useState<1 | 2>(1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showManage, setShowManage] = useState(false);

  const carouselRef = useRef<HTMLDivElement | null>(null);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

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
        if (!questionId) {
          setError("No question ID provided.");
          return;
        }
        const data = await fetchUserQuestionById(token, questionId);
        setUserQuestion(data.userQuestion);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load question.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [questionId, router]);

  const slideCount = useMemo(
    () => (userQuestion?.stories.length ?? 0) + (userQuestion?.stories.length ? 1 : 0),
    [userQuestion?.stories.length]
  );

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;

    const update = () => {
      const maxScrollLeft = Math.max(0, el.scrollWidth - el.clientWidth);
      setCanScrollLeft(el.scrollLeft > 4);
      setCanScrollRight(el.scrollLeft < maxScrollLeft - 4);

      if (slideCount === 0) {
        setActiveStoryIndex(0);
        return;
      }

      // Find the card whose left edge is closest to the scrollport's left padding.
      const children = Array.from(el.querySelectorAll<HTMLElement>("[data-carousel-item='story']"));
      if (children.length === 0) return;
      const containerRect = el.getBoundingClientRect();
      let bestIdx = 0;
      let bestDist = Number.POSITIVE_INFINITY;
      for (let i = 0; i < children.length; i++) {
        const r = children[i].getBoundingClientRect();
        const dist = Math.abs(r.left - containerRect.left);
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = i;
        }
      }
      setActiveStoryIndex(bestIdx);
    };

    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [slideCount]);

  const scrollCarouselBy = (direction: "left" | "right") => {
    const el = carouselRef.current;
    if (!el) return;
    const delta = Math.max(240, Math.round(el.clientWidth * 0.8));
    el.scrollBy({ left: direction === "left" ? -delta : delta, behavior: "smooth" });
  };

  const scrollToStoryIndex = (index: number) => {
    const el = carouselRef.current;
    if (!el) return;
    const children = Array.from(el.querySelectorAll<HTMLElement>("[data-carousel-item='story']"));
    const target = children[index];
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  };

  const handleDelete = async () => {
    if (!questionId) return;
    if (confirmStep === 1) {
      setConfirmStep(2);
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      setDeleting(true);
      await deleteUserQuestion(token, questionId);
      router.push("/saved-questions");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete question.");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
      setConfirmStep(1);
    }
  };

  if (loading) {
    return (
      <main className="main-content">
        <p className="text-muted text-14">Loading question...</p>
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
          className="back-btn mt-3"
          onClick={() => router.push("/saved-questions")}
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
          Back to Saved Questions
        </button>
      </main>
    );
  }

  if (!userQuestion) {
    return (
      <main className="main-content">
        <div className="card mb-3">
          <p className="text-muted text-14">Question not found.</p>
        </div>
        <button
          type="button"
          className="back-btn"
          onClick={() => router.push("/saved-questions")}
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
          Back to Saved Questions
        </button>
      </main>
    );
  }

  return (
    <main className="main-content">
      <div className="topbar">
        <button
          type="button"
          className="back-btn"
          onClick={() => router.push("/saved-questions")}
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
          Back to Saved Questions
        </button>
        <div className="btn-group">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setShowManage(true)}
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

      {/* Single card: question + divider + linked stories (one surface, like one detail view) */}
      <div className="card saved-question-detail">
        <header>
          <h1
            style={{
              fontSize: 21,
              fontWeight: 600,
              color: "var(--text-primary)",
              marginBottom: 8,
              lineHeight: 1.35,
              letterSpacing: "var(--tracking-tight)",
            }}
          >
            {userQuestion.question.content}
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-hint)", margin: "0 0 12px" }}>
            Saved:{" "}
            <time dateTime={userQuestion.createdAt}>
              {new Date(userQuestion.createdAt).toLocaleDateString()}
            </time>
          </p>
          {userQuestion.question.recommendedCategories &&
            userQuestion.question.recommendedCategories.length > 0 && (
              <div className="chips-row">
                {userQuestion.question.recommendedCategories.map((c) => (
                  <span key={c} className="tag">
                    {c}
                  </span>
                ))}
              </div>
            )}
        </header>

        <hr className="divider" />

        {showManage ? (
          <section
            className="saved-question-detail__manage"
            aria-labelledby="saved-question-manage-heading"
          >
            <h2 className="card-title" id="saved-question-manage-heading">
              Edit question &amp; linked stories
            </h2>
            <p className="saved-question-detail__linked-hint text-muted text-14">
              Update the question text, categories, and which stories are linked. Save when you are
              done.
            </p>
            <SavedQuestionManageForm
              questionId={userQuestion.id}
              userQuestion={userQuestion}
              onClose={() => setShowManage(false)}
              onSaved={async () => {
                const token = localStorage.getItem("token");
                if (!token || !questionId) return;
                const data = await fetchUserQuestionById(token, questionId);
                setUserQuestion(data.userQuestion);
                setShowManage(false);
              }}
            />
          </section>
        ) : (
          <section
            className="saved-question-detail__linked"
            aria-labelledby="saved-question-stories-heading"
          >
            <div className="card-head saved-question-detail__linked-head">
              <h2 className="card-title" id="saved-question-stories-heading">
                Linked stories
              </h2>
            </div>

            {userQuestion.stories.length > 0 && (
              <p className="saved-question-detail__linked-hint text-muted text-14">
                Stories you practice with for this question. Open one to review your answer.
              </p>
            )}

            {userQuestion.stories.length === 0 ? (
              <div className="saved-question-detail__linked-empty">
                <div className="saved-question-detail__story-cta-card saved-question-detail__story-cta-card--empty">
                  <div className="saved-question-detail__story-cta-title">
                    Add stories to practice with
                  </div>
                  <p className="saved-question-detail__story-cta-subtitle">
                    Link one or more STAR stories so you can review your answers for this question
                    in one place.
                  </p>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => setShowManage(true)}
                  >
                    + Add linked stories
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="saved-question-detail__carousel-row">
                <button
                  type="button"
                  className="saved-question-detail__carousel-nav pagination-arrow"
                  onClick={() => scrollCarouselBy("left")}
                  disabled={!canScrollLeft}
                  aria-label="Scroll linked stories left"
                >
                  ‹
                </button>
                <div className="saved-question-detail__carousel-viewport">
                  <div
                    ref={carouselRef}
                    className="carousel saved-question-detail__story-carousel"
                    aria-label="Linked stories carousel"
                  >
                  {userQuestion.stories.map((s) => {
                    const questionCats = userQuestion.question.recommendedCategories ?? [];
                    const orderedCats = orderedStoryCategories(s.categories, questionCats);
                    const highlight = questionCats.length > 0;
                    const visibleCats = orderedCats.slice(0, MAX_STORY_TAGS_ON_SLIDE);
                    const moreCount = Math.max(0, orderedCats.length - MAX_STORY_TAGS_ON_SLIDE);
                    return (
                    <div
                      key={s.id}
                      data-carousel-item="story"
                      className="saved-question-detail__story-slide"
                      role="button"
                      tabIndex={0}
                      aria-label={`Open story: ${s.title}`}
                      onClick={() => router.push(`/stories/${s.id}`)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          router.push(`/stories/${s.id}`);
                        }
                      }}
                    >
                      <div className="saved-question-detail__story-slide-head">
                        <div style={{ minWidth: 0 }}>
                          <div className="story-card-title">{s.title}</div>
                          {s.categories.length > 0 && (
                            <div className="story-card-cats" style={{ marginTop: 6 }}>
                              {visibleCats.map((cat) => (
                                <span
                                  key={cat}
                                  className={`tag${highlight && questionCats.includes(cat) ? " tag-match" : ""}`}
                                >
                                  {cat}
                                </span>
                              ))}
                              {moreCount > 0 && (
                                <span className="tag tag-more" aria-label={`${moreCount} more categories`}>
                                  +{moreCount}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          className="btn-secondary btn-size-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/stories/${s.id}`);
                          }}
                        >
                          Open
                        </button>
                      </div>

                      <div className="saved-question-detail__story-slide-body">
                        <div className="saved-question-detail__story-star">
                          <div className="saved-question-detail__story-star-label">Situation</div>
                          <div className="saved-question-detail__story-star-text">
                            {s.situation?.trim() ? s.situation : "No situation written yet."}
                          </div>
                        </div>
                        <div className="saved-question-detail__story-star">
                          <div className="saved-question-detail__story-star-label">Action</div>
                          <div className="saved-question-detail__story-star-text">
                            {s.action?.trim() ? s.action : "No action written yet."}
                          </div>
                        </div>
                        <div className="saved-question-detail__story-star">
                          <div className="saved-question-detail__story-star-label">Result</div>
                          <div className="saved-question-detail__story-star-text">
                            {s.result?.trim() ? s.result : "No result written yet."}
                          </div>
                        </div>
                      </div>

                    </div>
                    );
                  })}

                  <div
                    key="add-more-stories"
                    data-carousel-item="story"
                    className="saved-question-detail__story-slide saved-question-detail__story-slide--cta"
                    role="button"
                    tabIndex={0}
                    aria-label="Add or remove linked stories"
                    onClick={() => setShowManage(true)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setShowManage(true);
                      }
                    }}
                  >
                    <div className="saved-question-detail__story-cta-card">
                      <div className="saved-question-detail__story-cta-title">
                        + Add more stories
                      </div>
                      <p className="saved-question-detail__story-cta-subtitle">
                        Link additional stories to practice this question with.
                      </p>
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowManage(true);
                        }}
                      >
                        Choose stories
                      </button>
                    </div>
                  </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="saved-question-detail__carousel-nav pagination-arrow"
                  onClick={() => scrollCarouselBy("right")}
                  disabled={!canScrollRight}
                  aria-label="Scroll linked stories right"
                >
                  ›
                </button>
              </div>

              <div
                className="pagination-dots"
                role="tablist"
                aria-label="Linked stories pagination"
                style={{ justifyContent: "center", marginTop: 10 }}
              >
                {userQuestion.stories.map((s, idx) => (
                  <button
                    key={s.id}
                    type="button"
                    className={`pagination-dot${idx === activeStoryIndex ? " active" : ""}`}
                    onClick={() => scrollToStoryIndex(idx)}
                    aria-label={`Go to story ${idx + 1}: ${s.title}`}
                    aria-selected={idx === activeStoryIndex}
                    role="tab"
                  />
                ))}
                <button
                  key="add-more-stories-dot"
                  type="button"
                  className={`pagination-dot${userQuestion.stories.length === activeStoryIndex ? " active" : ""}`}
                  onClick={() => scrollToStoryIndex(userQuestion.stories.length)}
                  aria-label="Go to add more stories"
                  aria-selected={userQuestion.stories.length === activeStoryIndex}
                  role="tab"
                />
              </div>
              </>
            )}
          </section>
        )}
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
                  Remove this question from your list?
                </h3>
                <p className="modal-subtitle">
                  You can always re-save it from the common questions page.
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
                  <button type="button" className="btn-warn" onClick={handleDelete}>
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
                  Removing this question will also unlink all stories attached to it.
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
                    onClick={handleDelete}
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
