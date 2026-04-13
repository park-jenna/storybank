"use client";

import type { ButtonHTMLAttributes } from "react";
import styles from "./Chip.module.css";

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  size?: "sm" | "md";
  children: React.ReactNode;
  className?: string;
}

export default function Chip({
  selected = false,
  size = "md",
  className = "",
  ...props
}: ChipProps) {
  const classes = [
    styles.chip,
    styles[size],
    selected ? styles.selected : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={classes}
      aria-pressed={selected}
      {...props}
    />
  );
}
