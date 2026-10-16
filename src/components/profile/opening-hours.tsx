"use client";

import { useNow } from "@/hooks/use-now";
import { cx } from "@/lib/cx";
import { hoursList, openStatus } from "@/lib/data";
import type { Business } from "@/lib/types";
import styles from "./opening-hours.module.css";

/** The week's opening hours with today highlighted, and whether it is open right now. */
export function OpeningHours({ biz }: { biz: Business }) {
  const now = useNow();
  const st = openStatus(biz, now);

  return (
    <div className={styles.card}>
      <div className={styles.head}>
        <h2 className={styles.title}>Öppettider</h2>
        <span className={cx(styles.chip, st.open && styles.chipOpen)}>{st.label}</span>
      </div>
      {hoursList(biz, now).map((h) => (
        <div
          key={h.day}
          aria-current={h.today ? "date" : undefined}
          className={cx(styles.row, h.today && styles.today, h.closed && styles.closed)}
        >
          <span>{h.day}</span>
          <span className={styles.time}>{h.text}</span>
        </div>
      ))}
    </div>
  );
}
