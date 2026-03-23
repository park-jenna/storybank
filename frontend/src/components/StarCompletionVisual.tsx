export type StarCompletionVisualVariant = "card" | "inline";

const LETTERS = [
  { ch: "S", key: "s" as const },
  { ch: "T", key: "t" as const },
  { ch: "A", key: "a" as const },
  { ch: "R", key: "r" as const },
] as const;

function isFilled(
  key: "s" | "t" | "a" | "r",
  situation: boolean,
  action: boolean,
  result: boolean,
): boolean {
  if (key === "s" || key === "t") return situation;
  if (key === "a") return action;
  return result;
}

function buildDescription(
  situation: boolean,
  action: boolean,
  result: boolean,
): string {
  if (situation && action && result) {
    return "STAR complete: Situation and Task, Action, and Result are filled";
  }
  const missing: string[] = [];
  if (!situation) missing.push("Situation and Task");
  if (!action) missing.push("Action");
  if (!result) missing.push("Result");
  return `STAR incomplete — missing: ${missing.join(", ")}`;
}

/**
 * Each letter of STAR fills when that part of the story is written.
 * S and T both reflect Situation/Task (one field in this app).
 */
export function StarCompletionVisual({
  variant = "card",
  situation,
  action,
  result,
}: {
  variant?: StarCompletionVisualVariant;
  situation: boolean;
  action: boolean;
  result: boolean;
}) {
  const desc = buildDescription(situation, action, result);

  return (
    <div
      className={`star-completion-visual star-completion-visual--${variant}`}
      role="img"
      aria-label={desc}
      title={desc}
    >
      {LETTERS.map(({ ch, key }) => {
        const filled = isFilled(key, situation, action, result);
        return (
          <span
            key={key}
            className={`star-letter star-letter--${variant} ${
              filled ? "star-letter--filled" : "star-letter--empty"
            }`}
            aria-hidden
          >
            {ch}
          </span>
        );
      })}
    </div>
  );
}
