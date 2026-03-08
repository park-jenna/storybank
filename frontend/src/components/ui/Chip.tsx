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
    "inline-flex items-center justify-center gap-1 border rounded-[var(--radius)] font-medium cursor-pointer select-none bg-white text-[var(--foreground)] transition-all duration-200 whitespace-nowrap text-sm box-border py-2 px-3";
  const unselected =
    "border-gray-300 hover:-translate-y-0.5 hover:border-gray-400 hover:shadow-[var(--shadow)]";
  const selectedClass =
    "border-[var(--primary)] font-semibold bg-gradient-to-br from-[#ede9fe] to-[#e9d5ff] hover:from-[#e9d5ff] hover:to-[#ddd6fe] hover:border-[var(--primary-hover)] before:content-['✓'] before:font-bold before:text-xs before:text-[var(--primary)] before:mr-0.5";

  return (
    <button
      type="button"
      className={`chip-btn ${base} ${selected ? selectedClass : unselected} ${className}`}
      {...props}
    />
  );
}
