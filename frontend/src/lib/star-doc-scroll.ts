/** Scroll targets inside `.app-layout-body` (StoryBank shell), not the window. */

export function getMainScrollContainer(): HTMLElement | null {
  if (typeof document === "undefined") return null;
  return document.querySelector(".app-layout-body");
}

export function scrollToHashId(
  rawId: string,
  options?: { updateHash?: boolean },
): void {
  if (typeof window === "undefined") return;
  const id = rawId.startsWith("#") ? rawId.slice(1) : rawId;
  if (!id) return;

  const el = document.getElementById(id);
  if (!el) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const behavior: ScrollBehavior = reduce ? "auto" : "smooth";

  const main = getMainScrollContainer();
  if (main) {
    const mainRect = main.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const scrollMarginTop = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
    const nextTop = main.scrollTop + (elRect.top - mainRect.top) - scrollMarginTop;
    main.scrollTo({ top: Math.max(0, nextTop), behavior });
  } else {
    el.scrollIntoView({ behavior, block: "start", inline: "nearest" });
  }

  if (options?.updateHash !== false) {
    window.history.replaceState(null, "", `#${id}`);
  }
}
