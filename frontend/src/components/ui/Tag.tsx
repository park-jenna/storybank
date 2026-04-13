"use client";

import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Tag.module.css";

export type TagTone = "default" | "match" | "highlight" | "more";

interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: TagTone;
  children: ReactNode;
  className?: string;
}

const toneClasses: Record<TagTone, string> = {
  default: styles.default,
  match: styles.match,
  highlight: styles.highlight,
  more: styles.more,
};

export default function Tag({
  tone = "default",
  className = "",
  ...props
}: TagProps) {
  const classes = [styles.tag, toneClasses[tone], className]
    .filter(Boolean)
    .join(" ");

  return <span className={classes} {...props} />;
}
