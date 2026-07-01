"use client";

import { useState } from "react";

import { StarExampleTimeline } from "./StarExampleTimeline";

import styles from "./StarBeforeAfter.module.css";

const WEAKNESSES = [
  "No specific numbers or timeline",
  "Unclear what you personally did vs the team",
  "Decision-making process skipped entirely",
  "No follow-up actions or learning mentioned",
];

export function StarBeforeAfter() {
  const [view, setView] = useState<"before" | "after">("after");

  return (
    <div className={styles.wrapper}>
      <p className={styles.prompt}>
        &ldquo;Tell me about a time you had to deal with a sudden problem in
        production.&rdquo;
      </p>

      <div className={styles.tabs} role="tablist" aria-label="Compare answers">
        <button
          type="button"
          className={`${styles.tab} ${view === "before" ? styles.tabActive : ""}`}
          onClick={() => setView("before")}
          role="tab"
          aria-selected={view === "before"}
          aria-controls="before-after-panel"
        >
          Before
        </button>
        <button
          type="button"
          className={`${styles.tab} ${view === "after" ? styles.tabActive : ""}`}
          onClick={() => setView("after")}
          role="tab"
          aria-selected={view === "after"}
          aria-controls="before-after-panel"
        >
          After (STAR)
        </button>
      </div>

      <div id="before-after-panel" role="tabpanel">
        {view === "before" ? (
          <div className={styles.beforePanel}>
            <div className={styles.beforeBody}>
              <p>
                Um, so our team was running the checkout service, and we did a
                deploy on a Friday afternoon. Then a bunch of errors started
                happening. I looked at the logs and it was something about tax
                IDs, so my colleague and I worked on fixing it. We got it sorted
                in about 45 minutes I think.
              </p>
            </div>
            <p className={styles.weaknessLabel}>What gets lost</p>
            <ul className={styles.weaknessList}>
              {WEAKNESSES.map((w) => (
                <li key={w} className={styles.weaknessItem}>
                  {w}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className={styles.afterPanel}>
            <StarExampleTimeline />
          </div>
        )}
      </div>
    </div>
  );
}
