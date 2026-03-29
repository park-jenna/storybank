"use client";

import { useEffect, useId, useState } from "react";

function CheckGlyph() {
  return (
    <svg
      className="star-guide__check-icon"
      viewBox="0 0 14 14"
      width="14"
      height="14"
      aria-hidden
    >
      <path
        d="M2.5 7.2 5.4 10 11.5 3.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const TIPS = [
  {
    segmentKey: "st",
    step: 1,
    label: "Situation & Task",
    tagline: "Context and your responsibility",
    intro:
      "Give just enough context so the interviewer knows why this moment mattered—before you explain what you did.",
    checklist: [
      "When / where: team, product phase, deadline, or constraint",
      "Your role: use “I” for ownership, not only “we”",
      "The goal or problem in one clear sentence",
    ],
    example:
      "As the only PM on a small team, we had two weeks before launch and onboarding drop-off was unclear. I owned defining the problem and aligning eng + design on what to measure first.",
    pitfall: "Long backstory with no clear goal or your specific stake in it.",
  },
  {
    segmentKey: "a",
    step: 2,
    label: "Action",
    tagline: "What you said and did",
    intro:
      "This is the longest part of STAR. Show decisions, tradeoffs, and how you influenced others—not a vague team effort.",
    checklist: [
      "3–5 concrete steps in order (what you did first, next, last)",
      "Decisions you made and why (data, users, risk, timeline)",
      "How you communicated: meetings, docs, feedback you gave or sought",
    ],
    example:
      "I pulled the last 30 days of funnel data, ran three user interviews, wrote a one-page brief, and proposed we cut one optional step. I facilitated a 30-minute decision meeting and documented the agreed change in the ticket.",
    pitfall: "Passive voice or “the team decided” with no line to your actions.",
  },
  {
    segmentKey: "r",
    step: 3,
    label: "Result",
    tagline: "Outcomes and learning",
    intro:
      "Close the loop: what changed, how you know, and what you’d do again. Keep it tight—this is often 2–4 sentences when spoken.",
    checklist: [
      "Quantify when you can (% , time, revenue, users, errors)",
      "Qualitative impact if numbers aren’t available (sentiment, clarity, speed)",
      "What you learned or how you’d apply it next time",
    ],
    example:
      "Completion rose from 61% to 78% over two sprints. Stakeholders adopted the brief as a template. I learned to align on success metrics before debating solutions.",
    pitfall: "Ending with “it went well” with no evidence or reflection.",
  },
] as const;

const STORAGE_VIEW = "storybank-star-tips-view";
const STORAGE_CHECKS = "storybank-star-tips-checks";

type ViewMode = "full" | "checklist";

function itemId(segmentKey: string, index: number) {
  return `${segmentKey}:${index}`;
}

export function StarWritingTips() {
  const checkIdPrefix = useId();
  const [viewMode, setViewMode] = useState<ViewMode>("full");
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const v = sessionStorage.getItem(STORAGE_VIEW);
        if (v === "checklist" || v === "full") setViewMode(v);
        const raw = sessionStorage.getItem(STORAGE_CHECKS);
        if (raw) {
          const parsed: unknown = JSON.parse(raw);
          if (
            parsed &&
            typeof parsed === "object" &&
            !Array.isArray(parsed)
          ) {
            setChecked(parsed as Record<string, boolean>);
          }
        }
      } catch {
        /* ignore */
      }
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      sessionStorage.setItem(STORAGE_VIEW, viewMode);
    } catch {
      /* ignore */
    }
  }, [viewMode, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      sessionStorage.setItem(STORAGE_CHECKS, JSON.stringify(checked));
    } catch {
      /* ignore */
    }
  }, [checked, hydrated]);

  const setItemChecked = (id: string, next: boolean) => {
    setChecked((prev) => {
      const copy = { ...prev };
      if (next) copy[id] = true;
      else delete copy[id];
      return copy;
    });
  };

  const isChecklist = viewMode === "checklist";

  return (
    <aside
      className={`card star-guide${isChecklist ? " star-guide--checklist-mode" : ""}`}
      aria-label="STAR method writing guide"
    >
      <header className="star-guide__head">
        <h3 className="star-guide__title">STAR writing tips</h3>

        <fieldset className="star-guide__mode">
          <legend className="visually-hidden">Guide display mode</legend>
          <div className="star-guide__mode-inner">
            <label className="star-guide__mode-option">
              <input
                type="radio"
                className="visually-hidden"
                name="star-guide-view"
                value="full"
                checked={viewMode === "full"}
                onChange={() => setViewMode("full")}
              />
              <span className="star-guide__mode-label">Full guide</span>
            </label>
            <label className="star-guide__mode-option">
              <input
                type="radio"
                className="visually-hidden"
                name="star-guide-view"
                value="checklist"
                checked={viewMode === "checklist"}
                onChange={() => setViewMode("checklist")}
              />
              <span className="star-guide__mode-label">Checklist</span>
            </label>
          </div>
        </fieldset>

        <p className="star-guide__lede">
          {isChecklist ? (
            <>
              Tick items as you draft. Switch to{" "}
              <strong>Full guide</strong> for sample wording and common
              pitfalls.
            </>
          ) : (
            <>
              STAR names four parts (Situation, Task, Action, Result); this
              form matches them in <strong>three</strong> boxes—Situation
              &amp; Task share the first. Expand the sections below for sample
              wording or a quick sanity check. Use{" "}
              <strong>Checklist</strong> for a compact pass while you write.
            </>
          )}
        </p>
      </header>

      <div className="star-guide__track">
        {TIPS.map((tip, i) => (
          <article
            key={tip.segmentKey}
            className={`star-guide__step${i === TIPS.length - 1 ? " star-guide__step--last" : ""}`}
          >
            <span className="star-guide__marker" aria-hidden>
              {tip.step}
            </span>
            <div className="star-guide__content">
              <div className="star-guide__step-head">
                <h4 className="star-guide__label">{tip.label}</h4>
                <p className="star-guide__tag">{tip.tagline}</p>
              </div>
              {!isChecklist && (
                <p className="star-guide__intro">{tip.intro}</p>
              )}
              <ul
                className={`star-guide__list${isChecklist ? " star-guide__list--interactive" : ""}`}
              >
                {tip.checklist.map((item, idx) => {
                  const id = itemId(tip.segmentKey, idx);
                  const inputId = `${checkIdPrefix}-${id}`;
                  if (isChecklist) {
                    return (
                      <li key={item}>
                        <label
                          className={`star-guide__check-toggle${checked[id] ? " star-guide__check-toggle--done" : ""}`}
                          htmlFor={inputId}
                        >
                          <input
                            id={inputId}
                            type="checkbox"
                            className="visually-hidden star-guide__check-toggle-input"
                            checked={!!checked[id]}
                            onChange={(e) =>
                              setItemChecked(id, e.target.checked)
                            }
                          />
                          <span
                            className="star-guide__check-toggle-box"
                            aria-hidden
                          >
                            {checked[id] ? <CheckGlyph /> : null}
                          </span>
                          <span className="star-guide__check-toggle-text">
                            {item}
                          </span>
                        </label>
                      </li>
                    );
                  }
                  return (
                    <li key={item}>
                      <CheckGlyph />
                      <span>{item}</span>
                    </li>
                  );
                })}
              </ul>
              {!isChecklist && (
                <details className="star-guide__details">
                  <summary className="star-guide__summary">
                    Example &amp; what to avoid
                  </summary>
                  <div className="star-guide__details-inner">
                    <p className="star-guide__sample">{tip.example}</p>
                    <p className="star-guide__avoid">
                      <span className="star-guide__avoid-label">Avoid</span>
                      {tip.pitfall}
                    </p>
                  </div>
                </details>
              )}
            </div>
          </article>
        ))}
      </div>

      <footer className="star-guide__foot">
        <p>
          Tell the story out loud in about <strong>1–2 minutes</strong>: keep
          Situation and Result concise; spend a bit more time on Action.
        </p>
      </footer>
    </aside>
  );
}
