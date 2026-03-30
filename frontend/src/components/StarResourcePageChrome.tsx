"use client";

import { useEffect, useState } from "react";

const TOC_ITEMS = [
  { id: "star-intro", href: "#star-intro", label: "What is STAR?" },
  { id: "star-why", href: "#star-why", label: "Why it helps" },
  { id: "star-four", href: "#star-four", label: "The four parts" },
  { id: "star-tips", href: "#star-tips", label: "Before you answer" },
  { id: "star-prep", href: "#star-prep", label: "Preparing your stories" },
  { id: "star-storybank", href: "#star-storybank", label: "StoryBank & how to use it" },
  { id: "star-practice", href: "#star-practice", label: "Next steps" },
] as const;

function getScrollContainer(): HTMLElement | null {
  return document.querySelector(".app-layout-body");
}

export function StarResourceTocNav() {
  const [active, setActive] = useState<string>(TOC_ITEMS[0].id);

  useEffect(() => {
    const main = getScrollContainer();
    if (!main) return;

    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const mainRect = main.getBoundingClientRect();
        let best: (typeof TOC_ITEMS)[number]["id"] = TOC_ITEMS[0].id;
        let maxVisible = -1;

        for (const { id } of TOC_ITEMS) {
          const el = document.getElementById(id);
          if (!el) continue;
          const rect = el.getBoundingClientRect();
          const overlap =
            Math.min(rect.bottom, mainRect.bottom) - Math.max(rect.top, mainRect.top);
          const visible = Math.max(0, overlap);
          if (visible > maxVisible) {
            maxVisible = visible;
            best = id;
          }
        }

        if (maxVisible <= 0) {
          const line = mainRect.top + (mainRect.bottom - mainRect.top) * 0.22;
          let bestDist = Infinity;
          for (const { id } of TOC_ITEMS) {
            const el = document.getElementById(id);
            if (!el) continue;
            const top = el.getBoundingClientRect().top;
            const dist = Math.abs(top - line);
            if (dist < bestDist) {
              bestDist = dist;
              best = id;
            }
          }
        }

        setActive(best);
      });
    };

    update();
    main.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(raf);
      main.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <ul className="star-resource-aside-nav">
      {TOC_ITEMS.map(({ id, href, label }) => {
        const isActive = active === id;
        return (
          <li key={id}>
            <a
              href={href}
              className={
                isActive
                  ? "star-resource-aside-nav__link star-resource-aside-nav__link--active"
                  : "star-resource-aside-nav__link"
              }
              aria-current={isActive ? "location" : undefined}
            >
              {label}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

export function StarResourceBackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const main = document.querySelector(".app-layout-body");
    const onScroll = () => {
      const y = main?.scrollTop ?? window.scrollY;
      setVisible(y > 380);
    };
    onScroll();
    main?.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      main?.removeEventListener("scroll", onScroll);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      className="star-resource-back-top"
      onClick={() => {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const behavior: ScrollBehavior = reduce ? "auto" : "smooth";
        const main = document.querySelector(".app-layout-body");
        if (main && "scrollTo" in main) {
          (main as HTMLElement).scrollTo({ top: 0, behavior });
        } else {
          window.scrollTo({ top: 0, behavior });
        }
      }}
      aria-label="Back to top"
    >
      <svg viewBox="0 0 24 24" width={18} height={18} aria-hidden>
        <path
          fill="currentColor"
          d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z"
        />
      </svg>
      <span>Top</span>
    </button>
  );
}

/** Compact S–T–A–R jump row for the aside (avoids repeating full blurbs from the main column). */
export function StarResourceGlanceJump() {
  const jumps = [
    { letter: "S", href: "#star-part-s", label: "Situation" },
    { letter: "T", href: "#star-part-t", label: "Task" },
    { letter: "A", href: "#star-part-a", label: "Action" },
    { letter: "R", href: "#star-part-r", label: "Result" },
  ] as const;

  return (
    <div className="star-resource-glance-jump" role="navigation" aria-label="Jump to STAR sections">
      {jumps.map(({ letter, href, label }, i) => (
        <span key={letter} className="star-resource-glance-jump__item">
          {i > 0 && (
            <span className="star-resource-glance-jump__sep" aria-hidden>
              →
            </span>
          )}
          <a href={href} className="star-resource-glance-jump__link" title={`${label}`}>
            {letter}
          </a>
        </span>
      ))}
    </div>
  );
}
