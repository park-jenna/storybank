"use client";

import type {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

interface FormFieldProps {
  label: string;
  required?: boolean;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}

export function FormField({
  label,
  required,
  hint,
  className = "",
  children,
}: FormFieldProps) {
  return (
    <label className={`flex flex-col gap-sm ${className}`}>
      <span className="font-semibold text-[var(--foreground)]">
        {label}
        {required ? " *" : ""}
      </span>
      {children}
      {hint && (
        <span className="text-[13px] text-[var(--muted)]">{hint}</span>
      )}
    </label>
  );
}

const inputBase =
  "w-full pl-5 pr-4 py-3 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] outline-none transition-all duration-200 text-base font-[inherit] placeholder:text-[var(--muted-foreground)] focus:ring-[3px] focus:ring-[var(--ring)] focus:border-[var(--primary)]";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={inputBase} {...props} />;
}

export function Textarea(
  props: TextareaHTMLAttributes<HTMLTextAreaElement>
) {
  return (
    <textarea
      className={`${inputBase} min-h-[80px] resize-y`}
      {...props}
    />
  );
}
