"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, type CSSProperties } from "react";
import { Icon } from "@/components/ui/icon";
import { useDismiss } from "@/hooks/use-dismiss";
import { cx } from "@/lib/cx";
import { cities, cityById, norm } from "@/lib/data";
import styles from "./city-picker.module.css";

const PANEL_WIDTH = 300;
/** Minimum distance between the panel and the edges of the screen. */
const GUTTER = 12;

type Placement = { left: number; width: number; origin: number };

type CityPickerProps = {
  value: string;
  onChange: (id: string) => void;
  /** nav: compact pill in the header. inline: inside the home search bar. field: bordered form field. */
  variant?: "nav" | "inline" | "field";
  /** Which edge the dropdown panel aligns to. */
  align?: "left" | "right";
  /** Field variant only: stretch to the container width, always or just on phones. */
  block?: "always" | "mobile";
};

export function CityPicker({ value, onChange, variant = "field", align = "left", block }: CityPickerProps) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const [placement, setPlacement] = useState<Placement | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listId = useId();

  const close = useCallback(() => setOpen(false), []);
  useDismiss(rootRef, open, close);

  /**
   * Aligns the panel to the preferred edge of the button, then nudges it so it
   * always fits on screen (on phones the button can sit anywhere in a row).
   */
  const place = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;
    const r = root.getBoundingClientRect();
    const viewport = document.documentElement.clientWidth;
    const width = Math.min(PANEL_WIDTH, viewport - GUTTER * 2);
    const preferred = align === "right" ? r.right - width : r.left;
    const left = Math.max(GUTTER, Math.min(preferred, viewport - GUTTER - width));
    setPlacement({ left: left - r.left, width, origin: r.left + r.width / 2 - left });
  }, [align]);

  useEffect(() => {
    if (!open) return;
    window.addEventListener("resize", place);
    // Focus the search field, except on touch screens where it would pop the
    // keyboard up over the list.
    const t = window.matchMedia("(pointer: coarse)").matches
      ? 0
      : window.setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 40);
    return () => {
      window.removeEventListener("resize", place);
      window.clearTimeout(t);
    };
  }, [open, place]);

  const list = useMemo(() => {
    const needle = norm(q.trim());
    return cities.filter((c) => !needle || norm(c.name).includes(needle) || norm(c.region).includes(needle));
  }, [q]);

  const current = cityById[value];
  const cityName = current ? current.name : "Välj stad";

  function choose(id: string) {
    setOpen(false);
    setQ("");
    buttonRef.current?.focus({ preventScroll: true });
    if (id !== value) onChange(id);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    const n = list.length;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive(n ? (active + 1) % n : 0);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive(n ? (active - 1 + n) % n : 0);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (list[active]) choose(list[active].id);
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      setOpen(false);
      buttonRef.current?.focus({ preventScroll: true });
    }
  }

  const buttonProps = {
    ref: buttonRef,
    type: "button" as const,
    onClick: () => {
      if (!open) place();
      setOpen(!open);
      setQ("");
      setActive(0);
    },
    "aria-haspopup": "listbox" as const,
    "aria-expanded": open,
    "aria-label": `Stad: ${current ? current.name : "ingen vald"}. Byt stad`,
  };

  return (
    <div ref={rootRef} className={cx(styles.root, block === "always" && styles.blockAlways, block === "mobile" && styles.blockMobile)}>
      {variant === "nav" && (
        <button {...buttonProps} className={cx(styles.nav, open && styles.navOpen)}>
          <Icon name="map-pin" size={15} />
          {cityName}
          <Icon name="chevron-down" size={14} className={cx(styles.chevron, open && styles.chevronOpen)} />
        </button>
      )}
      {variant === "inline" && (
        <button {...buttonProps} className={cx(styles.inline, open && styles.inlineOpen)}>
          <Icon name="map-pin" size={18} className={styles.pin} />
          {cityName}
          <Icon name="chevron-down" size={15} className={cx(styles.chevron, open && styles.chevronOpen)} />
        </button>
      )}
      {variant === "field" && (
        <button {...buttonProps} className={cx(styles.field, open && styles.fieldOpen)}>
          <Icon name="map-pin" size={16} className={styles.pin} />
          <span>{cityName}</span>
          <Icon name="chevron-down" size={15} className={cx(styles.chevron, styles.chevronEnd, open && styles.chevronOpen)} />
        </button>
      )}

      <div
        className={cx(styles.panel, align === "right" ? styles.alignRight : styles.alignLeft, open && styles.panelOpen)}
        style={
          placement
            ? ({
                left: placement.left,
                right: "auto",
                width: placement.width,
                transformOrigin: `${placement.origin}px top`,
              } as CSSProperties)
            : undefined
        }
      >
        <div className={styles.searchWrap}>
          <label className={styles.search}>
            <Icon name="search" size={16} className={styles.searchIcon} />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setActive(0);
              }}
              onKeyDown={onKeyDown}
              placeholder="Sök stad"
              aria-label="Sök stad"
              aria-controls={listId}
              autoComplete="off"
            />
          </label>
        </div>
        <div id={listId} role="listbox" aria-label="Städer" className={styles.list}>
          {list.map((c, i) => {
            const selected = c.id === value;
            return (
              <button
                key={c.id}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => choose(c.id)}
                onMouseEnter={() => setActive(i)}
                className={cx(styles.option, i === active && styles.optionActive)}
              >
                <span className={styles.optionText}>
                  <span className={cx(styles.optionName, selected && styles.optionNameSelected)}>{c.name}</span>
                  <span className={styles.optionRegion}>{c.region}</span>
                </span>
                {selected && <Icon name="check" size={16} stroke={2.25} className={styles.check} />}
              </button>
            );
          })}
          {list.length === 0 && <div className={styles.empty}>Tipsly finns inte i den staden än.</div>}
        </div>
      </div>
    </div>
  );
}
