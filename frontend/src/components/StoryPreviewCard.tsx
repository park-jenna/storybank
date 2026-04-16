"use client";

import Link from "next/link";

import { StarCompletionVisual } from "@/components/StarCompletionVisual";
import { Tag } from "@/components/ui";
import styles from "./StoryPreviewCard.module.css";

export type StoryPreviewCardStory = {
  id: string;
  title: string;
  categories: string[];
  situation?: string | null;
  action?: string | null;
  result?: string | null;
};

type StoryPreviewCardProps = {
  story: StoryPreviewCardStory;
  href: string;
  matchedCategories?: string[];
  maxCategories?: number;
  previewFallback?: string;
};

function storyPreviewText(story: StoryPreviewCardStory, fallback: string): string {
  return (
    story.situation?.trim() ||
    story.result?.trim() ||
    story.action?.trim() ||
    fallback
  );
}

function orderedCategories(categories: string[], matchedCategories: string[]): string[] {
  const matched = new Set(matchedCategories);
  const matches = categories.filter((category) => matched.has(category));
  const rest = categories.filter((category) => !matched.has(category));
  return [...matches, ...rest];
}

export function StoryPreviewCard({
  story,
  href,
  matchedCategories = [],
  maxCategories = 3,
  previewFallback = "No preview written yet.",
}: StoryPreviewCardProps) {
  const matched = new Set(matchedCategories);
  const categories = orderedCategories(story.categories ?? [], matchedCategories);
  const visibleCategories = categories.slice(0, maxCategories);
  const moreCount = Math.max(0, categories.length - maxCategories);

  const situation = !!story.situation?.trim();
  const action = !!story.action?.trim();
  const result = !!story.result?.trim();
  const preview = storyPreviewText(story, previewFallback);

  return (
    <Link href={href} className={styles.link}>
      <article className={styles.card}>
        <header className={styles.header}>
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
        </header>

        <div className={styles.divider} />

        <p className={styles.preview}>{preview}</p>

        <footer className={styles.footer}>
          <StarCompletionVisual
            variant="card"
            situation={situation}
            action={action}
            result={result}
          />
        </footer>
      </article>
    </Link>
  );
}
