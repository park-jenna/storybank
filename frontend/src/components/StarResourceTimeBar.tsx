"use client";

import { useCallback } from "react";

const SEGMENTS = [
  {
    key: "s",
    letter: "S",
    pct: "~20%",
    label: "Situation",
    href: "#star-part-s",
    className: "star-resource-timebar__seg star-resource-timebar__seg--s",
  },
  {
    key: "t",
    letter: "T",
    pct: "~10%",
    label: "Task",
    href: "#star-part-t",
    className: "star-resource-timebar__seg star-resource-timebar__seg--t",
  },
  {
    key: "a",
    letter: "A",
    pct: "~60%",
    label: "Action",
    href: "#star-part-a",
    className: "star-resource-timebar__seg star-resource-timebar__seg--a",
  },
  {
    key: "r",
    letter: "R",
    pct: "~10%",
    label: "Result",
    href: "#star-part-r",
    className: "star-resource-timebar__seg star-resource-timebar__seg--r",
  },
] as const;

export function StarResourceTimeBar() {
  const onActivate = useCallback((href: string) => {
    const el = document.querySelector(href);
    if (!el) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }, []);

  return (
    <div
      className="star-resource-timebar star-resource-timebar--interactive"
      role="group"
      aria-label="Rough share of answer time for each STAR step. Select a step to jump to that section."
    >
      {SEGMENTS.map(({ key, letter, pct, label, href, className }) => (
        <button
          key={key}
          type="button"
          className={className}
          title={`${label} ${pct}`}
          aria-label={`${label}, ${pct}. Jump to ${label} details below.`}
          onClick={() => onActivate(href)}
        >
          <span className="star-resource-timebar__label">
            <span className="star-resource-timebar__letter" aria-hidden>
              {letter}
            </span>
            <span className="star-resource-timebar__pct">{pct}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
