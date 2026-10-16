"use client";

import { useNow } from "@/hooks/use-now";
import { periods } from "@/lib/data";
import styles from "./bid-countdown.module.css";

const pad = (n: number) => String(n).padStart(2, "0");

/** Live countdown to when this week's bidding closes. Ticks every second on its own. */
export function BidCountdown() {
  const now = useNow(1000);
  const ms = Math.max(0, periods(now).closesAt.getTime() - now.getTime());
  const dd = Math.floor(ms / 864e5);
  const hh = Math.floor(ms / 36e5) % 24;
  const mm = Math.floor(ms / 6e4) % 60;
  const ss = Math.floor(ms / 1e3) % 60;
  const units = [
    { v: pad(dd), l: dd === 1 ? "dag" : "dagar" },
    { v: pad(hh), l: "tim" },
    { v: pad(mm), l: "min" },
    { v: pad(ss), l: "sek" },
  ];

  return (
    <div
      role="timer"
      aria-label={`Budgivningen stänger om ${dd} dagar, ${hh} timmar och ${mm} minuter`}
      className={styles.timer}
      suppressHydrationWarning
    >
      {units.map((u, i) => (
        <div key={i} className={styles.unit}>
          <div className={styles.value} suppressHydrationWarning>
            {u.v}
          </div>
          <div className={styles.label} suppressHydrationWarning>
            {u.l}
          </div>
        </div>
      ))}
    </div>
  );
}
