"use client";

import Link from "next/link";
import { useCallback, useRef, type FormEvent } from "react";
import { Icon } from "@/components/ui/icon";
import { ScrollRow } from "@/components/ui/scroll-row";
import { useDismiss } from "@/hooks/use-dismiss";
import { cx } from "@/lib/cx";
import { categories, sorts } from "@/lib/data";
import type { Category, SortId, Subcategory } from "@/lib/types";
import { discoverHref } from "./discover-route";
import styles from "./discover-toolbar.module.css";

/* ------------------------------------------------------------------ */
/* Search                                                              */
/* ------------------------------------------------------------------ */

type SearchFieldProps = {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onClear: () => void;
};

export function SearchField({ value, placeholder, onChange, onSubmit, onClear }: SearchFieldProps) {
  return (
    <form
      role="search"
      className={styles.searchForm}
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <label className={styles.searchField}>
        <Icon name="search" size={17} className={styles.searchIcon} />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label="Sök bland resultaten"
          autoComplete="off"
          className={styles.searchInput}
        />
        {value.length > 0 && (
          <button type="button" onClick={onClear} aria-label="Rensa sökningen" className={styles.searchClear}>
            <Icon name="x" size={13} stroke={2} />
          </button>
        )}
      </label>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Sort: popover on desktop, bottom sheet on phones                    */
/* ------------------------------------------------------------------ */

type SortMenuProps = {
  value: SortId;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPick: (id: SortId) => void;
};

export function SortMenu({ value, open, onOpenChange, onPick }: SortMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => onOpenChange(false), [onOpenChange]);
  useDismiss(ref, open, close);
  const current = sorts.find((s) => s.id === value) ?? sorts[0];

  return (
    <div ref={ref} className={styles.sort}>
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cx(styles.sortButton, open && styles.sortButtonOpen)}
      >
        <Icon name="arrow-up-down" size={16} className={styles.sortIcon} />
        {current.label}
        <Icon name="chevron-down" size={15} className={cx(styles.chevron, open && styles.chevronOpen)} />
      </button>
      {open && <div onClick={close} className={styles.sheetBackdrop} />}
      <div role="listbox" aria-label="Sortera efter" className={cx(styles.sortPanel, open && styles.sortPanelOpen)}>
        <div className={styles.sheetHead}>
          <span className={styles.sheetHandle} />
          <span className={styles.sheetTitle}>Sortera efter</span>
        </div>
        {sorts.map((o) => {
          const selected = o.id === value;
          return (
            <button
              key={o.id}
              type="button"
              role="option"
              aria-selected={selected}
              onClick={() => onPick(o.id)}
              className={styles.sortOption}
            >
              <span className={cx(styles.sortCheck, selected && styles.sortCheckOn)}>
                <Icon name="check" size={16} stroke={2.25} />
              </span>
              <span className={styles.sortText}>
                <span className={styles.sortLabel}>{o.label}</span>
                <span className={styles.sortHint}>{o.hint}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* List / map toggle (desktop)                                         */
/* ------------------------------------------------------------------ */

export function ViewToggle({ isMap, onChange }: { isMap: boolean; onChange: (map: boolean) => void }) {
  return (
    <div role="tablist" aria-label="Visning" className={styles.toggle}>
      <button
        type="button"
        role="tab"
        aria-selected={!isMap}
        onClick={() => onChange(false)}
        className={cx(styles.toggleTab, !isMap && styles.toggleTabOn)}
      >
        <Icon name="layout-grid" size={16} />
        Lista
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={isMap}
        onClick={() => onChange(true)}
        className={cx(styles.toggleTab, isMap && styles.toggleTabOn)}
      >
        <Icon name="map" size={16} />
        Karta
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Category and subcategory chips                                      */
/* ------------------------------------------------------------------ */

type ChipsProps = { city: string; cat: Category | null; sub: Subcategory | null; keep: string };

export function CategoryChips({ city, cat, keep }: Omit<ChipsProps, "sub">) {
  const chips = [
    { id: "", label: "Alla", icon: "layout-grid" as const, href: discoverHref({ city }, keep), on: !cat },
    ...categories.map((k) => ({
      id: k.id,
      label: k.name,
      icon: k.icon,
      href: discoverHref({ city, cat: k.id }, keep),
      on: cat?.id === k.id,
    })),
  ];
  return (
    <ScrollRow className={styles.catChips} trackClassName={styles.catTrack}>
      {chips.map((c) => (
        <Link
          key={c.id}
          href={c.href}
          scroll={false}
          aria-current={c.on ? "page" : undefined}
          className={cx(styles.catChip, c.on && styles.catChipOn)}
        >
          <Icon name={c.icon} size={15} />
          {c.label}
        </Link>
      ))}
    </ScrollRow>
  );
}

export function SubcategoryChips({ city, cat, sub, keep }: ChipsProps) {
  if (!cat) return null;
  const chips = [
    { id: "", label: "Alla", href: discoverHref({ city, cat: cat.id }, keep), on: !sub },
    ...cat.subs.map((x) => ({
      id: x.id,
      label: x.plural,
      href: discoverHref({ city, cat: cat.id, sub: x.id }, keep),
      on: sub?.id === x.id,
    })),
  ];
  return (
    <ScrollRow key={cat.id} className={styles.subChips} trackClassName={styles.subTrack}>
      {chips.map((c) => (
        <Link
          key={c.id}
          href={c.href}
          scroll={false}
          aria-current={c.on ? "page" : undefined}
          className={cx(styles.subChip, c.on && styles.subChipOn)}
        >
          {c.label}
        </Link>
      ))}
    </ScrollRow>
  );
}
