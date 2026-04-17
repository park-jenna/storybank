import type { ReactNode } from "react";

import styles from "./PageHeader.module.css";

type PageHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  meta?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export default function PageHeader({
  title,
  description,
  eyebrow,
  meta,
  action,
  className = "",
}: PageHeaderProps) {
  const classes = [styles.header, className].filter(Boolean).join(" ");

  return (
    <header className={classes}>
      <div className={styles.copy}>
        {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
        <h1 className={styles.title}>{title}</h1>
        {description ? (
          <p className={styles.description}>{description}</p>
        ) : null}
      </div>

      {(meta || action) && (
        <div className={styles.aside}>
          {meta ? <div className={styles.meta}>{meta}</div> : null}
          {action}
        </div>
      )}
    </header>
  );
}
