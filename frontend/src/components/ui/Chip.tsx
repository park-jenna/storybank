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
    "inline-flex items-center justify-center gap-1.5 border-2 rounded-[var(--radius-lg)] font-medium cursor-pointer select-none bg-white text-[var(--foreground)] transition-all duration-200 whitespace-nowrap text-base box-border";
  const unselected =
    "border-gray-300 hover:-translate-y-0.5 hover:border-gray-400 hover:shadow-[var(--shadow)]";
  const selectedClass =
    "border-[var(--primary)] font-semibold bg-gradient-to-br from-[#ede9fe] to-[#e9d5ff] hover:from-[#e9d5ff] hover:to-[#ddd6fe] hover:border-[var(--primary-hover)] before:content-['✓'] before:font-bold before:text-lg before:text-[var(--primary)] before:mr-1";

  return (
    <button
      type="button"
      style={{ paddingLeft: 12, paddingRight: 12, paddingTop: 8, paddingBottom: 8 }}
      className={`${base} ${selected ? selectedClass : unselected} ${className}`}
      {...props}
    />
  );
}
