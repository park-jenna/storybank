"use client";

import React from "react";
import Link from "next/link";

import styles from "./StarHowSteps.module.css";

const STEPS = [
  {
    num: 1,
    title: "Capture stories",
    href: "/stories/new",
    desc: "Write several examples per theme — leadership, teamwork, failure, pressure — so one competency isn't riding on a single anecdote.",
    cta: "New story",
    illustration: "form",
  },
  {
    num: 2,
    title: "Link questions",
    href: "/common-questions",
    desc: "Save real prompts and link the stories that fit. Practice noticing when a new question is the same shape as one you already answered.",
    cta: "Common questions",
    illustration: "link",
  },
  {
    num: 3,
    title: "Spot gaps",
    href: "/dashboard",
    desc: "Find questions with no linked story, or STAR fields that still need detail before you rely on them in the room.",
    cta: "Dashboard",
    illustration: "chart",
  },
  {
    num: 4,
    title: "Practice loop",
    href: "/stories",
    desc: "Read a question out loud, name which story you would use, and practice until the map from prompt to proof feels automatic.",
    cta: "Practice flashcards",
    illustration: "cards",
  },
] as const;

function FormIllustration() {
  return (
    <div className={styles.illuForm}>
      <div className={styles.illuFormRow}>
        <span className={styles.illuLabel}>S</span>
        <div className={styles.illuLine} />
      </div>
      <div className={styles.illuFormRow}>
        <span className={styles.illuLabel}>A</span>
        <div className={`${styles.illuLine} ${styles.illuLineLong}`} />
      </div>
      <div className={styles.illuFormRow}>
        <span className={styles.illuLabel}>R</span>
        <div className={styles.illuLine} />
      </div>
    </div>
  );
}

function LinkIllustration() {
  return (
    <div className={styles.illuLink}>
      <div className={styles.illuQuestion} />
      <div className={styles.illuChips}>
        <div className={styles.illuChip} />
        <div className={styles.illuChip} />
      </div>
    </div>
  );
}

function ChartIllustration() {
  return (
    <div className={styles.illuChart}>
      <div className={styles.illuBarTrack}>
        <div className={styles.illuBarFill} />
      </div>
      <div className={styles.illuBarLabel}>70%</div>
    </div>
  );
}

function CardsIllustration() {
  return (
    <div className={styles.illuCards}>
      <div className={`${styles.illuCard} ${styles.illuCardBack}`} />
      <div className={styles.illuCard}>
        <div className={styles.illuCardLine} />
        <div className={`${styles.illuCardLine} ${styles.illuCardLineShort}`} />
      </div>
    </div>
  );
}

const ILLUSTRATIONS: Record<string, () => React.ReactElement> = {
  form: FormIllustration,
  link: LinkIllustration,
  chart: ChartIllustration,
  cards: CardsIllustration,
};

export function StarHowSteps() {
  return (
    <div className={styles.grid}>
      {STEPS.map((step) => {
        const Illu = ILLUSTRATIONS[step.illustration];
        return (
          <div key={step.num} className={styles.card}>
            <div className={styles.numBadge}>{step.num}</div>
            <div className={styles.illuWrap}>
              <Illu />
            </div>
            <h4 className={styles.title}>{step.title}</h4>
            <p className={styles.desc}>{step.desc}</p>
            <Link href={step.href} className={`btn-secondary ${styles.cta}`}>
              {step.cta}
            </Link>
          </div>
        );
      })}
    </div>
  );
}
