"use client";

import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "default" | "primary" | "danger" | "menu";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<ButtonVariant, string> = {
  default:
    "bg-[var(--card)] text-[var(--foreground)] border-[var(--border)] hover:bg-[var(--background-solid)] hover:border-[var(--primary)] hover:-translate-y-px hover:shadow-[var(--shadow)]",
  primary:
    "bg-[var(--primary)] text-white border-transparent hover:bg-[var(--primary-hover)] hover:shadow-[var(--shadow-md)]",
  danger:
    "bg-[#ef4444] text-white border-transparent hover:bg-[#dc2626]",
  menu:
    "bg-transparent border-none text-[var(--muted)] hover:text-[var(--foreground)] shadow-none hover:shadow-none hover:-translate-y-0",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "text-[15px]",
  md: "text-base",
  lg: "text-lg",
};

const sizePadding: Record<ButtonSize, React.CSSProperties> = {
  sm: { padding: "8px 16px" },
  md: { padding: "10px 20px" },
  lg: { padding: "12px 24px" },
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-[var(--radius)] font-medium cursor-pointer select-none transition-all duration-200 whitespace-nowrap no-underline disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none active:scale-[0.98]";

export default function Button({
  variant = "default",
  size = "md",
  className = "",
  disabled,
  style,
  ...props
}: ButtonProps) {
  const isMenu = variant === "menu";
  const border = isMenu ? "" : "border";
  const paddingStyle = isMenu ? {} : sizePadding[size];
  return (
    <button
      type={props.type ?? "button"}
      style={{ ...paddingStyle, ...style }}
      className={`${base} ${border} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled}
      {...props}
    />
  );
}
