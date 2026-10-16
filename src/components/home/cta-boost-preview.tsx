"use client";

import { useNow } from "@/hooks/use-now";
import { kr, market, periods } from "@/lib/data";
import styles from "./business-cta.module.css";

const leadingBid = kr(market("malmo", "skonhet").leading);

/** Decorative mock of a sponsored listing and the weekly Boost auction for next week. */
export function CtaBoostPreview() {
  const now = useNow();
  const p = periods(now);

  return (
    <div aria-hidden="true" className={styles.mock}>
      <div className={styles.mockCard}>
        <div className={styles.mockSmall}>Frisörer i Malmö</div>
        <div className={styles.mockBiz}>
          <span className={styles.mockAvatar}>SL</span>
          <div className={styles.mockBizText}>
            <div className={styles.mockBizName}>Studio Ljung</div>
            <div className={styles.mockBizMeta}>Frisör · Möllevången</div>
          </div>
          <span className={styles.mockChip}>Sponsrad</span>
        </div>
      </div>
      <div className={styles.mockCard}>
        <div className={styles.mockHead}>
          <span>Tipsly Boost · vecka {p.next.week}</span>
          <span className={styles.mockExample}>Exempel</span>
        </div>
        <div className={styles.mockBidRow}>
          <div>
            <div className={styles.mockBidLabel}>Ledande bud</div>
            <div className={styles.mockBid}>{leadingBid}</div>
          </div>
          <span className={styles.mockButton}>Lägg bud</span>
        </div>
        <div className={styles.mockTrack}>
          <div className={styles.mockFill} />
        </div>
        <div className={styles.mockCloses}>Budgivningen stänger {p.closesText}</div>
      </div>
    </div>
  );
}
