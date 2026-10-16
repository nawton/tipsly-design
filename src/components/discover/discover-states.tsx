import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/ui/icon";
import { cx } from "@/lib/cx";
import styles from "./discover-states.module.css";

const SKELETONS = [0, 1, 2, 3, 4, 5, 6, 7];

/** Placeholder grid shown while a listing loads. */
export function ResultsSkeleton() {
  return (
    <div aria-busy="true" aria-label="Laddar resultat" className={styles.skeletonGrid}>
      {SKELETONS.map((i) => (
        <div key={i} className={styles.skeleton} style={{ animationDelay: i * 90 + "ms" }}>
          <div className={styles.skeletonPhoto} />
          <div className={styles.skeletonBody}>
            <div className={cx(styles.bar, styles.bar1)} />
            <div className={cx(styles.bar, styles.bar2)} />
            <div className={cx(styles.bar, styles.bar3)} />
            <div className={cx(styles.bar, styles.bar4)} />
          </div>
        </div>
      ))}
    </div>
  );
}

type StateCardProps = {
  icon: IconName;
  tone?: "neutral" | "danger";
  title: ReactNode;
  balance?: boolean;
  text: ReactNode;
  alert?: boolean;
  children?: ReactNode;
};

/** The white message card used for the empty and error states. */
export function StateCard({ icon, tone = "neutral", title, balance, text, alert, children }: StateCardProps) {
  return (
    <div role={alert ? "alert" : undefined} className={styles.card}>
      <span className={cx(styles.icon, tone === "danger" && styles.iconDanger)}>
        <Icon name={icon} size={24} />
      </span>
      <h2 className={cx(styles.title, balance && styles.titleBalance)}>{title}</h2>
      <p className={styles.text}>{text}</p>
      {children}
    </div>
  );
}

export function StateActions({ children }: { children: ReactNode }) {
  return <div className={styles.actions}>{children}</div>;
}

export const stateStyles = {
  primary: styles.primary,
  secondary: styles.secondary,
  retry: styles.retry,
};
