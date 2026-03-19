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
  default: "btn-secondary",
  primary: "btn-primary",
  danger: "btn-danger",
  menu: "btn-ghost",
};

const sizePadding: Record<ButtonSize, React.CSSProperties> = {
  sm: { padding: "8px 16px" },
  md: { padding: "10px 20px" },
  lg: { padding: "12px 24px" },
};

export default function Button({
  variant = "default",
  size = "md",
  className = "",
  disabled,
  style,
  ...props
}: ButtonProps) {
  const paddingStyle = sizePadding[size];
  return (
    <button
      type={props.type ?? "button"}
      style={{ ...paddingStyle, ...style }}
      className={`${variantClasses[variant]} ${className}`}
      disabled={disabled}
      {...props}
    />
  );
}
