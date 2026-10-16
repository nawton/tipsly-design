import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./dashboard-ui.module.css";

/** Wrapper for one dashboard tab: a column that rises in when the tab opens. */
export function TabSection({ children, plain = false }: { children: ReactNode; plain?: boolean }) {
  return <div className={cx(styles.tab, !plain && styles.tabStack)}>{children}</div>;
}

/** Large tab title with an optional lead paragraph. */
export function PageHeader({ title, lead }: { title: string; lead: string }) {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.lead}>{lead}</p>
    </header>
  );
}

/** White rounded panel used for each settings group. */
export function Card({
  children,
  className,
  ...rest
}: { children: ReactNode; className?: string } & HTMLAttributes<HTMLElement>) {
  return (
    <section className={cx(styles.card, className)} {...rest}>
      {children}
    </section>
  );
}

/** On/off switch (role="switch"). */
export function Switch({ on, label, onToggle }: { on: boolean; label: string; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onToggle}
      className={cx(styles.switch, on && styles.switchOn)}
    >
      <span className={styles.knob} />
    </button>
  );
}

/** Class for a card's h2. */
export const cardTitle = styles.cardTitle;

/** Shared form-field classes for the profile and settings tabs. */
export const field = {
  wrap: styles.field,
  label: styles.fieldLabel,
  input: styles.input,
  invalid: styles.inputInvalid,
  error: styles.fieldError,
};
