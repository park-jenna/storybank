"use client";

import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`text-center py-14 px-6 bg-[var(--card)] border-2 border-dashed border-[var(--border)] rounded-[var(--radius-xl)] my-10 ${className}`}
    >
      {icon && <div className="text-4xl mb-4">{icon}</div>}
      <h3 className="text-xl font-semibold mt-4 mb-2 text-[var(--foreground)]">
        {title}
      </h3>
      <p className="text-[var(--muted)] mb-6 text-[15px]">{description}</p>
      {action}
    </div>
  );
}
