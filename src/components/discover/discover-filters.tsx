"use client";

import { useCallback, useRef } from "react";
import { Icon } from "@/components/ui/icon";
import { useDismiss } from "@/hooks/use-dismiss";
import { cx } from "@/lib/cx";
import { nf } from "@/lib/data";
import styles from "./discover-filters.module.css";

type FilterBarProps = {
  openNow: boolean;
  topRated: boolean;
  onToggleOpen: () => void;
  onToggleTop: () => void;
  onClear: () => void;
  total: number;
  infoOpen: boolean;
  onInfoOpenChange: (open: boolean) => void;
};

/** "Öppet nu" and "Betyg 4,5+" toggles, the result count and the "Så rankar vi" popover. */
export function FilterBar({ openNow, topRated, onToggleOpen, onToggleTop, onClear, total, infoOpen, onInfoOpenChange }: FilterBarProps) {
  const infoRef = useRef<HTMLDivElement>(null);
  const closeInfo = useCallback(() => onInfoOpenChange(false), [onInfoOpenChange]);
  useDismiss(infoRef, infoOpen, closeInfo);

  return (
    <div className={styles.bar}>
      <div className={styles.filters}>
        <FilterToggle label="Öppet nu" on={openNow} onClick={onToggleOpen} />
        <FilterToggle label="Betyg 4,5+" on={topRated} onClick={onToggleTop} />
        {(openNow || topRated) && (
          <button type="button" onClick={onClear} className={styles.clear}>
            Rensa filter
          </button>
        )}
      </div>
      <div className={styles.meta}>
        <span aria-live="polite" className={styles.count}>
          <span className={styles.countValue}>{total === 1 ? "1 företag" : nf(total) + " företag"}</span> · exempeldata
        </span>
        <div ref={infoRef} className={styles.info}>
          <button
            type="button"
            onClick={() => onInfoOpenChange(!infoOpen)}
            aria-expanded={infoOpen}
            className={cx(styles.infoButton, infoOpen && styles.infoButtonOpen)}
          >
            <Icon name="info" size={15} />
            Så rankar vi
          </button>
          <div className={cx(styles.infoPanel, infoOpen && styles.infoPanelOpen)}>
            <div className={styles.infoTitle}>Så rankar vi</div>
            <p>Överst kan en sponsrad placering visas. Den är köpt via Tipsly Boost och alltid märkt.</p>
            <p>Alla andra resultat sorteras efter det du väljer. Ingen kan betala för att flyttas upp i dem.</p>
            <p>Betyg och omdömen går inte att köpa eller påverka med Boost.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterToggle({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on} className={cx(styles.toggle, on && styles.toggleOn)}>
      <Icon name={on ? "check" : "plus"} size={14} stroke={2} />
      {label}
    </button>
  );
}
