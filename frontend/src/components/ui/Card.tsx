"use client";

import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "story" | "overview" | "error";
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<CardProps["variant"] & string, string> = {
  default: "card",
  story: "story-card",
  overview: "card card--overview",
  error: "card card--error",
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
