"use client";

import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "story" | "overview" | "error";
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<CardProps["variant"] & string, string> = {
  default:
    "bg-[var(--card)] border border-[var(--border-light)] rounded-[var(--radius-lg)] p-6 shadow-[var(--shadow)] hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5 transition-all duration-200",
  story:
    "bg-[var(--card)] border-2 border-[var(--border-light)] rounded-[var(--radius-lg)] p-6 shadow-[var(--shadow)] hover:-translate-y-1 hover:shadow-[var(--shadow-lg)] hover:border-[var(--border)] flex flex-col gap-5 h-[320px] overflow-hidden cursor-pointer transition-all duration-200",
  overview:
    "bg-[var(--card)] border border-[var(--border-light)] rounded-[var(--radius-xl)] shadow-[var(--shadow)]",
  error:
    "bg-[var(--card)] border border-[var(--accent-red)] rounded-[var(--radius-lg)] p-6",
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
