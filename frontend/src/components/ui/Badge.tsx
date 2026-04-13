"use client";

import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Badge.module.css";

export type BadgeTone = "neutral" | "success" | "warning" | "danger";
export type BadgeSize = "sm" | "md";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  size?: BadgeSize;
  children: ReactNode;
  className?: string;
}

const toneClasses: Record<BadgeTone, string> = {
  neutral: styles.neutral,
  success: styles.success,
  warning: styles.warning,
  danger: styles.danger,
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: styles.sm,
  md: styles.md,
};

export default function Badge({
  tone = "neutral",
  size = "md",
  className = "",
  ...props
}: BadgeProps) {
  const classes = [
    styles.badge,
    toneClasses[tone],
    sizeClasses[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <span className={classes} {...props} />;
}
