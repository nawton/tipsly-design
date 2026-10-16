"use client";

import { useNow } from "@/hooks/use-now";
import { cx } from "@/lib/cx";
import { openStatus } from "@/lib/data";
import type { Business } from "@/lib/types";
import styles from "./open-status.module.css";

/** "Öppet nu · stänger 19:00", from the current Stockholm time. */
export function OpenStatus({ biz }: { biz: Business }) {
  const now = useNow();
  const st = openStatus(biz, now);

  return (
    <span className={cx(styles.status, st.open && styles.open)}>
      <span className={styles.dot} />
      <span className={styles.label}>{st.label}</span>
      <span className={styles.detail}>· {st.detail}</span>
    </span>
  );
}
