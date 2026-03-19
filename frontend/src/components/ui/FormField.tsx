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
    <label className={`field ${className}`}>
      <div className="field-label">
        <span>{label}</span>
        {required ? <span className="field-required"> *</span> : null}
      </div>
      {children}
      {hint ? <div className="field-hint">{hint}</div> : null}
    </label>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className="input" {...props} />;
}

export function Textarea(
  props: TextareaHTMLAttributes<HTMLTextAreaElement>
) {
  return (
    <textarea className="textarea" {...props} />
  );
}
