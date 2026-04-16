"use client";

import { Tag } from "@/components/ui";
import styles from "./StoryAnswerCard.module.css";

export type StoryAnswerCardStory = {
  id: string;
  title: string;
  categories: string[];
  situation?: string | null;
  action?: string | null;
  result?: string | null;
};

type StoryAnswerCardProps = {
  story: StoryAnswerCardStory;
  matchedCategories?: string[];
  maxCategories?: number;
  onOpen: () => void;
};

function orderedCategories(categories: string[], matchedCategories: string[]): string[] {
  const matched = new Set(matchedCategories);
  const matches = categories.filter((category) => matched.has(category));
  const rest = categories.filter((category) => !matched.has(category));
  return [...matches, ...rest];
}

function StarAnswerBlock({
  label,
  children,
}: {
  label: string;
  children: string;
}) {
  return (
    <section className={styles.starBlock}>
      <h4 className={styles.starLabel}>{label}</h4>
      <p className={styles.starText}>{children}</p>
    </section>
  );
}

export function StoryAnswerCard({
  story,
  matchedCategories = [],
  maxCategories = 3,
  onOpen,
}: StoryAnswerCardProps) {
  const matched = new Set(matchedCategories);
  const categories = orderedCategories(story.categories ?? [], matchedCategories);
  const visibleCategories = categories.slice(0, maxCategories);
  const moreCount = Math.max(0, categories.length - maxCategories);

  return (
    <article
      data-carousel-item="story"
      className={styles.card}
      aria-label={`Linked story: ${story.title}`}
    >
      <header className={styles.header}>
        <div className={styles.heading}>
          <h3 className={styles.title}>{story.title}</h3>
          {visibleCategories.length > 0 && (
            <div className={styles.tags} aria-label="Story categories">
              {visibleCategories.map((category) => (
                <Tag
                  key={category}
                  tone={matched.has(category) ? "match" : "default"}
                >
                  {category}
                </Tag>
              ))}
              {moreCount > 0 && (
                <Tag tone="more" aria-label={`${moreCount} more categories`}>
                  +{moreCount}
                </Tag>
              )}
            </div>
          )}
        </div>

        <button type="button" className="btn-secondary btn-size-sm" onClick={onOpen}>
          Open
        </button>
      </header>

      <div className={styles.body}>
        <StarAnswerBlock label="Situation">
          {story.situation?.trim() || "No situation written yet."}
        </StarAnswerBlock>
        <StarAnswerBlock label="Action">
          {story.action?.trim() || "No action written yet."}
        </StarAnswerBlock>
        <StarAnswerBlock label="Result">
          {story.result?.trim() || "No result written yet."}
        </StarAnswerBlock>
      </div>
    </article>
  );
}
