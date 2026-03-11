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
  const base =
    "chip chip-btn inline-flex items-center justify-center gap-1 font-medium cursor-pointer select-none transition-all duration-200 whitespace-nowrap text-sm box-border py-2 px-3";
  const selectedClass = selected ? "chip-selected" : "";

  return (
    <button
      type="button"
      className={`${base} ${selectedClass} ${className}`}
      {...props}
    />
  );
}
