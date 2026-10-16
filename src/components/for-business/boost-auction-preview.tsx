"use client";

import { Icon } from "@/components/ui/icon";
import { useNow } from "@/hooks/use-now";
import { kr, market, periods } from "@/lib/data";
import styles from "./boost-explainer.module.css";

const m = market("malmo", "skonhet");
const BIDS = [
  { who: "Du", amount: kr(m.leading + 50), mine: true },
  { who: "Budgivare A", amount: kr(m.leading), mine: false },
  { who: "Budgivare B", amount: kr(m.bids[1].amount), mine: false },
];

/** Decorative example of next week's auction for hairdressers in Malmö, with the visitor in the lead. */
export function BoostAuctionPreview() {
  const now = useNow();
  const nextWeek = periods(now).next.week;

  return (
    <div aria-hidden="true" className={styles.mock}>
      <div className={styles.mockHead}>
        <div>
          <div className={styles.mockSmall}>Topplacering · vecka {nextWeek}</div>
          <div className={styles.mockMarket}>Frisörer & skönhet, Malmö</div>
        </div>
        <span className={styles.mockExample}>Exempel</span>
      </div>
      <div className={styles.mockLeadRow}>
        <div>
          <div className={styles.mockSmall}>Ledande bud</div>
          <div className={styles.mockLeading}>{BIDS[0].amount}</div>
        </div>
        <span className={styles.mockLeader}>
          <Icon name="circle-check" size={15} />
          Du leder
        </span>
      </div>
      <div className={styles.mockBids}>
        {BIDS.map((b) => (
          <div key={b.who} className={b.mine ? styles.mockBidMine : styles.mockBid}>
            <span className={styles.mockWho}>{b.who}</span>
            <span className={styles.mockAmount}>{b.amount}</span>
          </div>
        ))}
      </div>
      <div className={styles.mockButton}>Lägg bud</div>
    </div>
  );
}
