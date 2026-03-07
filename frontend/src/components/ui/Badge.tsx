"use client";

import { getBadgeClass } from "@/constants/categories";

interface BadgeProps {
  category: string;
  className?: string;
}

export default function Badge({ category, className = "" }: BadgeProps) {
  const badgeClass = getBadgeClass(category);
  return (
    <span className={`badge ${badgeClass} ${className}`}>{category}</span>
  );
}
