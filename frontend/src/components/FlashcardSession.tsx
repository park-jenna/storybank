"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Story } from "@/lib/stories";
import { CATEGORIES } from "@/constants/categories";
import { Chip } from "@/components/ui";

import styles from "./FlashcardSession.module.css";

type FlashcardSessionProps = {
  stories: Story[];
  storyQuestionMap: Map<string, string>;
  onClose: () => void;
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const TIMER_SECONDS = 90;

export function FlashcardSession({
  stories,
  storyQuestionMap,
  onClose,
}: FlashcardSessionProps) {
  const [phase, setPhase] = useState<"setup" | "practice">("setup");
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

  const [queue, setQueue] = useState<Story[]>([]);
  const [totalCards, setTotalCards] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(TIMER_SECONDS);
  const [masteredCount, setMasteredCount] = useState(0);
  const backContentRef = useRef<HTMLDivElement>(null);

  const filteredStories = useMemo(() => {
    if (selectedTags.size === 0) return [];
    return stories.filter((s) =>
      (s.categories ?? []).some((c) => selectedTags.has(c)),
    );
  }, [stories, selectedTags]);

  const toggleTag = useCallback((cat: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }, []);

  const handleStartPractice = useCallback(() => {
    const shuffled = shuffle(filteredStories);
    setQueue(shuffled);
    setTotalCards(shuffled.length);
    setPhase("practice");
  }, [filteredStories]);

  // ── Practice phase logic ──

  const current = queue[0] ?? null;
  const done = phase === "practice" && queue.length === 0;

  const timerExpired = secondsLeft <= 0;
  useEffect(() => {
    if (phase !== "practice" || done || isFlipped || timerExpired) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [phase, done, isFlipped, timerExpired]);

  useEffect(() => {
    const scrollContainer = document.querySelector<HTMLElement>(".app-layout-body");
    if (scrollContainer) scrollContainer.style.overflow = "hidden";
    return () => {
      if (scrollContainer) scrollContainer.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleFlip = useCallback(() => {
    setIsFlipped(true);
  }, []);

  const handlePracticeAgain = useCallback(() => {
    setQueue((q) => [...q.slice(1), q[0]]);
    setIsFlipped(false);
    setSecondsLeft(TIMER_SECONDS);
    backContentRef.current?.scrollTo(0, 0);
  }, []);

  const handleMastered = useCallback(() => {
    setQueue((q) => q.slice(1));
    setMasteredCount((c) => c + 1);
    setIsFlipped(false);
    setSecondsLeft(TIMER_SECONDS);
    backContentRef.current?.scrollTo(0, 0);
  }, []);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timerDisplay = `${minutes}:${seconds.toString().padStart(2, "0")}`;
  const timerProgress = secondsLeft / TIMER_SECONDS;

  const linkedQuestion = useMemo(
    () => (current ? storyQuestionMap.get(current.id) : undefined),
    [current, storyQuestionMap],
  );

  // ── Close button (shared) ──

  const closeButton = (
    <button
      type="button"
      className={styles.closeBtn}
      onClick={onClose}
      aria-label="Close practice session"
    >
      <svg width={20} height={20} viewBox="0 0 20 20" fill="none">
        <path
          d="M5 5l10 10M15 5L5 15"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );

  // ── SETUP PHASE ──

  if (phase === "setup") {
    const canStart = filteredStories.length > 0;

    return (
      <div className={styles.overlay} role="dialog" aria-label="Session setup">
        <div className={styles.header}>
          <div className={styles.headerLeft} />
          <div className={styles.progress}>Session Setup</div>
          {closeButton}
        </div>

        <div className={styles.stage}>
          <div className={styles.setupBody}>
            <h2 className={styles.setupHeading}>
              Choose categories to practice
            </h2>

            <div
              className={`chips-row ${styles.setupChips}`}
              role="group"
              aria-label="Filter by category"
            >
              {CATEGORIES.map((cat) => (
                <Chip
                  key={cat}
                  selected={selectedTags.has(cat)}
                  onClick={() => toggleTag(cat)}
                >
                  {cat}
                </Chip>
              ))}
            </div>

            <p className={styles.setupStatus}>
              {selectedTags.size === 0
                ? "Please select at least one tag to start practicing."
                : `${filteredStories.length} ${filteredStories.length === 1 ? "story" : "stories"} selected based on your tags.`}
            </p>

            <button
              type="button"
              className="btn-primary"
              disabled={!canStart}
              onClick={handleStartPractice}
            >
              Start Practice 🚀
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── COMPLETE SCREEN ──

  if (done) {
    return (
      <div className={styles.overlay} role="dialog" aria-label="Practice complete">
        <div className={styles.completeScreen}>
          <div className={styles.completeEmoji}>🎉</div>
          <h2 className={styles.completeTitle}>Practice Session Complete!</h2>
          <p className={styles.completeSubtext}>
            You practiced {masteredCount}{" "}
            {masteredCount === 1 ? "story" : "stories"}
          </p>
          <button type="button" className="btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    );
  }

  // ── PRACTICE PHASE ──

  const cardPosition = masteredCount + 1;

  return (
    <div className={styles.overlay} role="dialog" aria-label="Flashcard practice">
      <div className={styles.header}>
        <div className={styles.headerLeft} />
        <div className={styles.progress}>
          Card {cardPosition} of {totalCards}
        </div>
        {closeButton}
      </div>

      <div className={styles.stage}>
        <div className={styles.cardContainer}>
          <div
            className={`${styles.cardInner} ${isFlipped ? styles.flipped : ""}`}
          >
            {/* ---- FRONT ---- */}
            <div
              className={styles.cardFace + " " + styles.cardFront}
              onClick={!isFlipped ? handleFlip : undefined}
              role={!isFlipped ? "button" : undefined}
              tabIndex={!isFlipped ? 0 : undefined}
              onKeyDown={
                !isFlipped
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleFlip();
                      }
                    }
                  : undefined
              }
              style={!isFlipped ? { cursor: "pointer" } : undefined}
            >
              <svg
                className={styles.flipIcon}
                width={18}
                height={18}
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M21 3v5h-5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3 21v-5h5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3 10a9 9 0 0 1 15.36-5.36L21 8M21 14a9 9 0 0 1-15.36 5.36L3 16"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              <div className={styles.frontContent}>
                {linkedQuestion && (
                  <p className={styles.linkedQuestion}>{linkedQuestion}</p>
                )}
                <h2 className={styles.storyTitle}>{current.title}</h2>
              </div>

              <div className={styles.frontFooter}>
                <div className={styles.timerWrap}>
                  <svg
                    className={styles.timerRing}
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <circle
                      className={styles.timerTrack}
                      cx={24}
                      cy={24}
                      r={20}
                    />
                    <circle
                      className={styles.timerFill}
                      cx={24}
                      cy={24}
                      r={20}
                      strokeDasharray={2 * Math.PI * 20}
                      strokeDashoffset={
                        2 * Math.PI * 20 * (1 - timerProgress)
                      }
                    />
                  </svg>
                  <span
                    className={`${styles.timerText} ${secondsLeft <= 10 ? styles.timerWarn : ""}`}
                    aria-label={`${minutes} minutes ${seconds} seconds remaining`}
                  >
                    {timerDisplay}
                  </span>
                </div>

              </div>
            </div>

            {/* ---- BACK ---- */}
            <div className={styles.cardFace + " " + styles.cardBack}>
              <div className={styles.backHeader}>
                <h3 className={styles.backTitle}>{current.title}</h3>
                <span
                  className={`${styles.timerFrozen} ${secondsLeft <= 10 ? styles.timerWarn : ""}`}
                >
                  {timerDisplay}
                </span>
              </div>

              <div className={styles.backContent} ref={backContentRef}>
                {current.situation?.trim() && (
                  <div className={styles.starSection}>
                    <div className={styles.starLabel}>Situation / Task</div>
                    <p className={styles.starText}>{current.situation}</p>
                  </div>
                )}
                {current.action?.trim() && (
                  <div className={styles.starSection}>
                    <div className={styles.starLabel}>Action</div>
                    <p className={styles.starText}>{current.action}</p>
                  </div>
                )}
                {current.result?.trim() && (
                  <div className={styles.starSection}>
                    <div className={styles.starLabel}>Result</div>
                    <p className={styles.starText}>{current.result}</p>
                  </div>
                )}
              </div>

              <div className={styles.backFooter}>
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={queue.length <= 1}
                  onClick={handlePracticeAgain}
                >
                  Practice Again 🔄
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleMastered}
                >
                  Mastered! ✅
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
