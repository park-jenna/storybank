import type { HTMLAttributes, ReactNode } from "react";

import styles from "./EmptyState.module.css";

type EmptyStateVariant = "default" | "solid";
type EmptyStateSize = "default" | "compact";

interface EmptyStateProps extends Pick<HTMLAttributes<HTMLDivElement>, "role"> {
  icon?: ReactNode;
  title?: ReactNode;
  description: ReactNode;
  action?: ReactNode;
  variant?: EmptyStateVariant;
  size?: EmptyStateSize;
  centered?: boolean;
  spaced?: boolean;
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  variant = "default",
  size = "default",
  centered = false,
  spaced = false,
  className = "",
  role,
}: EmptyStateProps) {
  const classes = [
    styles.root,
    variant === "solid" && styles.solid,
    size === "compact" && styles.compact,
    centered && styles.centered,
    spaced && styles.spaced,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} role={role}>
      {icon ? <div className={styles.icon}>{icon}</div> : null}
      {title ? <h3 className={styles.title}>{title}</h3> : null}
      <p className={styles.description}>{description}</p>
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  );
}
