"use client";

import type { ButtonHTMLAttributes } from "react";

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  children: React.ReactNode;
  className?: string;
}

export default function Chip({
  selected = false,
  className = "",
  ...props
}: ChipProps) {
  return (
    <button
      type="button"
      className={`chip ${selected ? "active" : ""} ${className}`}
      aria-pressed={selected}
      {...props}
    />
  );
}
