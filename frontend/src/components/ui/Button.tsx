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

const sizeClasses: Record<ButtonSize, string> = {
  sm: "btn-size-sm",
  md: "btn-size-md",
  lg: "btn-size-lg",
};

export default function Button({
  variant = "default",
  size = "md",
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type={props.type ?? "button"}
      className={`${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled}
      {...props}
    />
  );
}
