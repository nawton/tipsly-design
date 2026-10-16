"use client";

import { BusinessCard } from "@/components/business/business-card";
import type { Business } from "@/lib/types";
import styles from "./discover-results.module.css";

type SponsoredProps = { biz: Business };

/** The Boost slot above the organic results. */
export function SponsoredSection({ biz }: SponsoredProps) {
  return (
    <section aria-label="Sponsrad placering" className={styles.sponsored}>
      <div className={styles.sponsoredHead}>
        <h2 className={styles.heading}>Sponsrad</h2>
        <span className={styles.note}>Tillfällig topplacering köpt via Tipsly Boost. Påverkar inte resultaten nedan.</span>
      </div>
      <BusinessCard biz={biz} layout="row" compactOnMobile sponsoredSlot />
    </section>
  );
}

type ResultsGridProps = {
  items: Business[];
  total: number;
  sortLabel: string;
  onMore: () => void;
};

/** "Alla resultat" as a card grid with "Visa fler". */
export function ResultsGrid({ items, total, sortLabel, onMore }: ResultsGridProps) {
  return (
    <>
      <div className={styles.listHead}>
        <h2 className={styles.heading}>Alla resultat</h2>
        <span className={styles.note}>Sorterade efter {sortLabel.toLowerCase()}</span>
      </div>
      <div className={styles.grid}>
        {items.map((b) => (
          <BusinessCard key={b.id} biz={b} compactOnMobile />
        ))}
      </div>
      {total > items.length && (
        <div className={styles.more}>
          <button type="button" onClick={onMore} className={styles.moreButton}>
            Visa fler
          </button>
          <span className={styles.moreCount}>
            Visar {items.length} av {total}
          </span>
        </div>
      )}
    </>
  );
}
