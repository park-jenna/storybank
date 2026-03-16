"use client";

interface StarSectionProps {
  label: string;
  content: string;
  className?: string;
}

export default function StarSection({
  label,
  content,
  className = "",
}: StarSectionProps) {
  return (
    <div
      className={`py-4 px-5 border-l-[3px] border-l-[var(--muted-foreground)] ${className}`}
    >
      <div className="font-extrabold text-sm tracking-widest uppercase text-[var(--muted-foreground)]">
        {label}
      </div>
      <p className="mt-2 mb-0 text-[var(--muted)] whitespace-pre-wrap">
        {content || `No ${label.toLowerCase()} provided.`}
      </p>
    </div>
  );
}
