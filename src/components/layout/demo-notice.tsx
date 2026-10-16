"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import styles from "./demo-notice.module.css";

export function DemoNotice() {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <div className={styles.notice}>
      <div className={styles.inner}>
        <span className={styles.text}>Förhandsversion. Alla företag, betyg, omdömen, siffror och bud är påhittade exempel.</span>
        <button type="button" onClick={() => setOpen(false)} aria-label="Stäng meddelandet" className={styles.close}>
          <Icon name="x" size={13} stroke={2} />
        </button>
      </div>
    </div>
  );
}
