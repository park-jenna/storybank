"use client";

import type {
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";
import styles from "./FormField.module.css";

interface FormFieldProps {
  label: ReactNode;
  required?: boolean;
  hint?: string;
  error?: string | null;
  className?: string;
  children: ReactNode;
}

export function FormField({
  label,
  required,
  hint,
  error,
  className = "",
  children,
}: FormFieldProps) {
  const classes = [styles.field, className].filter(Boolean).join(" ");

  return (
    <label className={classes}>
      <span className={styles.label}>
        <span>{label}</span>
        {required ? (
          <span className={styles.required} aria-hidden>
            *
          </span>
        ) : null}
      </span>
      {hint ? <span className={styles.hint}>{hint}</span> : null}
      {children}
      {error ? (
        <span className={styles.error} role="alert">
          {error}
        </span>
      ) : null}
    </label>
  );
}

export function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  const classes = [styles.control, styles.input, className]
    .filter(Boolean)
    .join(" ");

  return <input className={classes} {...props} />;
}

export function Textarea(
  { className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>
) {
  const classes = [styles.control, styles.textarea, className]
    .filter(Boolean)
    .join(" ");

  return (
    <textarea className={classes} {...props} />
  );
}
