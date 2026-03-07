"use client";

import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "story" | "overview" | "error";
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<CardProps["variant"] & string, string> = {
  default:
    "bg-[var(--card)] border border-[var(--border-light)] rounded-[var(--radius-lg)] p-6 shadow-[0_2px_12px_rgba(139,92,246,0.08)] hover:shadow-[0_8px_24px_rgba(139,92,246,0.12)] hover:-translate-y-0.5 transition-all duration-200",
  story:
    "bg-[var(--card)] border-2 border-[var(--border-light)] rounded-[var(--radius-lg)] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:border-gray-300 flex flex-col gap-4 h-[300px] overflow-hidden cursor-pointer transition-all duration-200",
  overview:
    "mt-6 p-6 bg-[var(--card)] border border-[var(--border-light)] rounded-[var(--radius-xl)] shadow-[0_2px_12px_rgba(139,92,246,0.08)]",
  error:
    "bg-[var(--card)] border border-red-300 rounded-[var(--radius-lg)] p-6",
};

export function Card({
  variant = "default",
  className = "",
  ...props
}: CardProps) {
  return (
    <div className={`${variantClasses[variant]} ${className}`} {...props} />
  );
}
