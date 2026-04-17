import { Card } from "@/components/ui";

import styles from "./StarBreakdown.module.css";

type StarPartKey = "situation" | "action" | "result";

type StarPart = {
  key: StarPartKey;
  step: number;
  label: string;
  sublabel: string;
  tip: string;
  empty: string;
};

const STAR_PARTS: StarPart[] = [
  {
    key: "situation",
    step: 1,
    label: "Situation & Task",
    sublabel: "Context & goal",
    tip: "Keep it to 2-3 sentences about the context and your specific role or goal.",
    empty: "No situation or task provided.",
  },
  {
    key: "action",
    step: 2,
    label: "Action",
    sublabel: "What you did",
    tip: "Describe 3-5 concrete steps you personally took to move things forward.",
    empty: "No action provided.",
  },
  {
    key: "result",
    step: 3,
    label: "Result",
    sublabel: "Impact & learning",
    tip: "Highlight measurable outcomes, impact on others, and what you learned.",
    empty: "No result provided.",
  },
];

type StarBreakdownProps = {
  situation?: string | null;
  action?: string | null;
  result?: string | null;
  framed?: boolean;
  className?: string;
};

export function StarBreakdown({
  situation,
  action,
  result,
  framed = true,
  className = "",
}: StarBreakdownProps) {
  const values: Record<StarPartKey, string | null | undefined> = {
    situation,
    action,
    result,
  };

  const content = (
    <div
      className={[
        styles.root,
        !framed && styles.unframed,
        className,
      ].filter(Boolean).join(" ")}
      aria-label="STAR breakdown"
    >
      <h3 className={styles.title}>STAR breakdown</h3>

      <div className={styles.list}>
        {STAR_PARTS.map((part) => {
          const content = values[part.key]?.trim();
          return (
            <section
              key={part.key}
              className={styles.item}
              aria-label={part.label}
              data-empty={content ? undefined : "true"}
            >
              <div className={styles.marker} aria-hidden>
                {part.step}
              </div>

              <div className={styles.body}>
                <div className={styles.head}>
                  <span className={styles.label}>{part.label}</span>
                  <span className={styles.sublabel}>{part.sublabel}</span>
                </div>
                <p className={styles.tip}>{part.tip}</p>
                {content ? (
                  <p className={styles.text}>{content}</p>
                ) : (
                  <p className={styles.empty}>{part.empty}</p>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );

  if (!framed) return content;

  return (
    <Card padding="lg" className={styles.frame}>
      {content}
    </Card>
  );
}
