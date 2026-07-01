"use client";

import { useCallback, useState } from "react";

import styles from "./StarLetterAccordion.module.css";

const LETTERS = [
  {
    key: "s",
    letter: "S",
    name: "Situation",
    pct: "~20%",
    summary: "Set the scene in 1–2 sentences",
    detail:
      "Who was involved, what system or project you were in, and what was going wrong or what opportunity you faced. Skip org charts and backstory unless the interviewer asks.",
    id: "star-part-s",
  },
  {
    key: "t",
    letter: "T",
    name: "Task",
    pct: "~10%",
    summary: "State the goal you personally owned",
    detail:
      "A metric, a deadline, a risk to reduce, or a decision the team needed. One clean sentence is often enough.",
    id: "star-part-t",
  },
  {
    key: "a",
    letter: "A",
    name: "Action",
    pct: "~60%",
    summary: "Walk through what you did, step by step",
    detail:
      'How you diagnosed the issue, who you aligned with, what you built or changed, and how you handled tradeoffs. Use "I" for your work; name the team when credit is shared, but stay specific about your role.',
    highlight: true,
    id: "star-part-a",
  },
  {
    key: "r",
    letter: "R",
    name: "Result",
    pct: "~10%",
    summary: "Close with outcomes and proof",
    detail:
      "Numbers, time saved, fewer incidents, happier customers, or a process that stuck. If the ending was mixed, say what you learned and what you would do differently—briefly.",
    id: "star-part-r",
  },
];

export function StarLetterAccordion() {
  const [openKey, setOpenKey] = useState<string | null>(null);

  const toggle = useCallback((key: string) => {
    setOpenKey((prev) => (prev === key ? null : key));
  }, []);

  return (
    <div className={styles.list}>
      {LETTERS.map((item) => {
        const isOpen = openKey === item.key;
        const panelId = `letter-panel-${item.key}`;
        const triggerId = `letter-trigger-${item.key}`;

        return (
          <div
            key={item.key}
            id={item.id}
            className={`${styles.item} ${item.highlight ? styles.itemHighlight : ""}`}
          >
            <button
              id={triggerId}
              type="button"
              className={styles.trigger}
              onClick={() => toggle(item.key)}
              aria-expanded={isOpen}
              aria-controls={panelId}
            >
              <div className={`${styles.badge} ${styles[`badge_${item.key}`]}`}>
                {item.letter}
              </div>
              <div className={styles.triggerText}>
                <span className={styles.name}>{item.name}</span>
                <span className={styles.summary}>{item.summary}</span>
              </div>
              <span className={styles.pct}>{item.pct}</span>
              <span
                className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
                aria-hidden
              >
                <svg viewBox="0 0 12 12" width={12} height={12}>
                  <path
                    d="M3 4.5L6 7.5L9 4.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </button>

            <div
              id={panelId}
              role="region"
              aria-labelledby={triggerId}
              className={`${styles.panel} ${isOpen ? styles.panelOpen : ""}`}
              hidden={!isOpen}
            >
              <p className={styles.detail}>{item.detail}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
