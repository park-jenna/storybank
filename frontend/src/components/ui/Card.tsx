"use client";

import type { HTMLAttributes } from "react";
import styles from "./Card.module.css";

export type CardTone = "default" | "muted" | "error";
export type CardPadding = "none" | "sm" | "md" | "lg";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  tone?: CardTone;
  padding?: CardPadding;
  children: React.ReactNode;
  className?: string;
}

const toneClasses: Record<CardTone, string> = {
  default: styles.default,
  muted: styles.muted,
  error: styles.error,
};

const paddingClasses: Record<CardPadding, string> = {
  none: styles.paddingNone,
  sm: styles.paddingSm,
  md: styles.paddingMd,
  lg: styles.paddingLg,
};

export function Card({
  tone = "default",
  padding = "md",
  className = "",
  ...props
}: CardProps) {
  const classes = [
    styles.card,
    toneClasses[tone],
    paddingClasses[padding],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} {...props} />
  );
}
