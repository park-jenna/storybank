"use client";

import { useCallback, useState } from "react";

import styles from "./StarExampleTimeline.module.css";

const BLOCKS = [
  {
    key: "s",
    letter: "S",
    label: "Situation",
    content: [
      "I was on call for our checkout service on a Friday afternoon. Error rates jumped right after a routine deploy, and the support queue started filling with customers who could not complete purchases.",
    ],
    tip: "Two sentences: what service, what went wrong, why it mattered. No org chart, no backstory — the interviewer can ask follow-ups if they want more context.",
  },
  {
    key: "t",
    letter: "T",
    label: "Task",
    content: [
      "I needed to stop the bleeding quickly, figure out whether to roll back or patch forward, and keep support and leadership informed without guessing out loud.",
    ],
    tip: "One sentence with three clear goals. Notice it names what the speaker personally owned — not what the team was supposed to do.",
  },
  {
    key: "a",
    letter: "A",
    label: "Action",
    content: [],
    steps: [
      {
        title: "Diagnosed",
        body: "I pulled the last hour of logs and traced failures to a new validation rule that rejected a subset of tax IDs we had not tested against production data.",
      },
      {
        title: "Chose a path",
        body: "I paired with another engineer, reproduced the case in staging, and gave leadership two options: roll back immediately or ship a targeted hotfix with extra monitoring.",
      },
      {
        title: "Shipped and followed up",
        body: "I shipped the fix behind a feature flag, watched metrics for thirty minutes, ramped traffic, then wrote a support timeline and filed the missing test cases.",
      },
    ],
    tip: "This is 60% of the answer — three paragraphs of specific actions. Every sentence starts with 'I' or names who did what. Diagnosis → collaboration → decision framework → execution → follow-up.",
  },
  {
    key: "r",
    letter: "R",
    label: "Result",
    content: [
      "Checkout errors returned to normal within about forty-five minutes. We had no further incidents that weekend. The missing test case was added in the next sprint, and the runbook now includes a checklist for that validation path.",
    ],
    tip: "Concrete outcomes: 45-minute recovery, zero repeat incidents, a process improvement that stuck. Numbers + lasting impact in two sentences.",
  },
] as const;

export function StarExampleTimeline() {
  const [openTip, setOpenTip] = useState<string | null>(null);

  const toggleTip = useCallback((key: string) => {
    setOpenTip((prev) => (prev === key ? null : key));
  }, []);

  return (
    <div className={styles.timeline}>
      {BLOCKS.map((block) => {
        const tipOpen = openTip === block.key;
        return (
          <div key={block.key} className={styles.item}>
            <div className={styles.track}>
              <div className={`${styles.line} ${styles[`line_${block.key}`]}`} />
              <div className={`${styles.badge} ${styles[`badge_${block.key}`]}`}>
                {block.letter}
              </div>
              <div className={`${styles.line} ${styles.lineBottom} ${styles[`line_${block.key}`]}`} />
            </div>

            <div className={styles.card}>
              <div className={styles.cardHead}>
                <span className={styles.label}>{block.label}</span>
                <button
                  type="button"
                  className={`${styles.tipBtn} ${tipOpen ? styles.tipBtnActive : ""}`}
                  onClick={() => toggleTip(block.key)}
                  aria-expanded={tipOpen}
                  aria-label={`Writing tip for ${block.label}`}
                >
                  Tip
                </button>
              </div>

              <div className={styles.cardBody}>
                {block.content.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
                {"steps" in block && block.steps && (
                  <ol className={styles.actionSteps}>
                    {block.steps.map((step) => (
                      <li key={step.title} className={styles.actionStep}>
                        <span className={styles.actionStepTitle}>{step.title}</span>
                        <span className={styles.actionStepBody}>{step.body}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>

              <div
                className={`${styles.tipPanel} ${tipOpen ? styles.tipPanelOpen : ""}`}
                role="region"
                aria-label={`${block.label} writing tip`}
                hidden={!tipOpen}
              >
                <p className={styles.tipText}>{block.tip}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
