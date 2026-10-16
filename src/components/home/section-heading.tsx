import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./section-heading.module.css";

type SectionHeadingProps = {
  title: string;
  lead: string;
  /** Optional control aligned to the bottom right (a link or a toggle). */
  action?: ReactNode;
  className?: string;
};

/** Large section title with a lead paragraph, used by every home page section. */
export function SectionHeading({ title, lead, action, className }: SectionHeadingProps) {
  return (
    <div className={cx(styles.head, className)}>
      <div className={styles.text}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.lead}>{lead}</p>
      </div>
      {action}
    </div>
  );
}
