"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { getMainScrollContainer, scrollToHashId } from "@/lib/star-doc-scroll";

const TOC_ITEMS = [
  { id: "star-what", href: "#star-what", label: "What is STAR method?" },
  { id: "star-when", href: "#star-when", label: "When to use" },
  { id: "star-how", href: "#star-how", label: "How to use" },
  { id: "star-example", href: "#star-example", label: "STAR example" },
  { id: "star-storybank", href: "#star-storybank", label: "How StoryBank can help" },
] as const;

type TocId = (typeof TOC_ITEMS)[number]["id"];

function getScrollContainer(): HTMLElement | null {
  return getMainScrollContainer();
}

/**
 * Pick the section with the largest visible height inside the main scroll container.
 * Tie-break: prefer the later section so handoff at boundaries (e.g. Example → StoryBank) feels natural.
 */
function computeActiveSectionId(): TocId {
  const main = getScrollContainer();
  if (!main) return TOC_ITEMS[0].id;

  const mainRect = main.getBoundingClientRect();
  let best: TocId = TOC_ITEMS[0].id;
  let bestVisible = -1;
  let bestIdx = 0;

  for (let i = 0; i < TOC_ITEMS.length; i++) {
    const { id } = TOC_ITEMS[i];
    const el = document.getElementById(id);
    if (!el) continue;

    const r = el.getBoundingClientRect();
    const vTop = Math.max(r.top, mainRect.top);
    const vBottom = Math.min(r.bottom, mainRect.bottom);
    const visible = Math.max(0, vBottom - vTop);

    const wins =
      visible > bestVisible || (visible === bestVisible && visible > 0 && i > bestIdx);
    if (wins) {
      bestVisible = visible;
      best = id;
      bestIdx = i;
    }
  }

  if (bestVisible <= 0) {
    const lineY = mainRect.top + mainRect.height * 0.22;
    let fallback: TocId = TOC_ITEMS[0].id;
    for (const { id } of TOC_ITEMS) {
      const el = document.getElementById(id);
      if (!el) continue;
      if (el.getBoundingClientRect().top <= lineY + 16) fallback = id;
    }
    return fallback;
  }

  return best;
}

function scrollToSectionId(id: TocId) {
  scrollToHashId(id);
}

const TOC_CLICK_LOCK_MS = 900;

function useStarDocTocNav() {
  const [activeId, setActiveId] = useState<TocId>(TOC_ITEMS[0].id);
  const clickLockUntilRef = useRef(0);

  useEffect(() => {
    const main = getScrollContainer();
    if (!main) return;

    let raf = 0;
    const runSpy = () => {
      if (Date.now() < clickLockUntilRef.current) return;
      setActiveId(computeActiveSectionId());
    };

    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(runSpy);
    };

    schedule();
    main.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    const onScrollEnd = () => {
      clickLockUntilRef.current = 0;
      runSpy();
    };
    main.addEventListener("scrollend", onScrollEnd);

    return () => {
      cancelAnimationFrame(raf);
      main.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      main.removeEventListener("scrollend", onScrollEnd);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.location.hash.slice(1) as TocId;
    if (!raw || !TOC_ITEMS.some((t) => t.id === raw)) return;

    requestAnimationFrame(() => {
      scrollToSectionId(raw);
      setActiveId(raw);
    });
  }, []);

  const navigateToSection = useCallback((id: TocId) => {
    clickLockUntilRef.current = Date.now() + TOC_CLICK_LOCK_MS;
    setActiveId(id);
    scrollToSectionId(id);
  }, []);

  return { activeId, navigateToSection };
}

/** Sticky right rail — section links only; active state is the single source of truth (interview-tips). */
export function StarResourceAsideNav() {
  const { activeId, navigateToSection } = useStarDocTocNav();

  return (
    <div className="star-doc-aside__inner">
      <p className="star-doc-aside__label" id="star-toc-label">
        On this page
      </p>
      <ul className="star-doc-toc" aria-labelledby="star-toc-label">
        {TOC_ITEMS.map(({ id, href, label }) => {
          const isActive = activeId === id;
          return (
            <li key={id} className="star-doc-toc__item">
              <a
                href={href}
                className={isActive ? "star-doc-toc__a star-doc-toc__a--active" : "star-doc-toc__a"}
                aria-current={isActive ? "location" : undefined}
                onClick={(e) => {
                  if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                  e.preventDefault();
                  navigateToSection(id);
                }}
              >
                {label}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
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
      className="star-doc-back-top"
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
