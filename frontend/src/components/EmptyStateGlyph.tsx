type EmptyStateGlyphKind = "help" | "books" | "clipboard" | "search" | "document";

const svgBase = {
  viewBox: "0 0 24 24" as const,
  className: "empty-state-glyph",
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true as const,
};

/** Monochrome stroke icons for `.empty-state-icon` (replaces emoji). */
export function EmptyStateGlyph({ kind }: { kind: EmptyStateGlyphKind }) {
  switch (kind) {
    case "help":
      return (
        <svg {...svgBase}>
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );
    case "books":
      return (
        <svg {...svgBase}>
          <path d="M12 7v14" />
          <path d="M3 5a2 2 0 0 1 2-2h7v16H5a2 2 0 0 1-2-2V5Z" />
          <path d="M21 5a2 2 0 0 0-2-2h-7v16h7a2 2 0 0 0 2-2V5Z" />
        </svg>
      );
    case "clipboard":
      return (
        <svg {...svgBase}>
          <rect x="8" y="2" width="8" height="4" rx="1" />
          <path d="M9 4H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2" />
          <path d="M9 12h6M9 16h6M9 8h2" />
        </svg>
      );
    case "search":
      return (
        <svg {...svgBase}>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      );
    case "document":
      return (
        <svg {...svgBase}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
          <path d="M14 2v6h6" />
          <path d="M9 13h6M9 17h4M9 9h1" />
        </svg>
      );
  }
}
