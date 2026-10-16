"use client";

import { useRouter } from "next/navigation";
import { useId, useMemo, useRef, useState, type CSSProperties } from "react";
import { useCity } from "@/components/providers/app-providers";
import { CityPicker } from "@/components/ui/city-picker";
import { Icon } from "@/components/ui/icon";
import { cx } from "@/lib/cx";
import { cityById, matchSub, suggest } from "@/lib/data";
import { routes } from "@/lib/routes";
import type { SuggestItem } from "@/lib/types";
import styles from "./home-search.module.css";

/**
 * The big search field on the home page: a combobox with category, business
 * and city suggestions, plus the city picker and the submit button.
 */
export function HomeSearch() {
  const router = useRouter();
  const { city, setCity } = useCity();
  const [q, setQ] = useState("");
  const [focus, setFocus] = useState(false);
  const [active, setActive] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const optionId = (i: number) => `${listId}-${i}`;

  const groups = useMemo(() => suggest(q, city), [q, city]);
  const flat = useMemo(() => groups.flatMap((g) => g.items), [groups]);
  // Index of each group's first item in `flat`, for keyboard highlighting.
  const offsets = useMemo(
    () => groups.reduce<number[]>((acc, g, i) => [...acc, i === 0 ? 0 : acc[i - 1] + groups[i - 1].items.length], []),
    [groups],
  );

  const open = focus;
  const hasQ = q.trim().length > 0;
  const cityName = cityById[city]?.name ?? "";

  function close() {
    setFocus(false);
    setActive(-1);
    inputRef.current?.blur();
  }

  function choose(it: SuggestItem) {
    close();
    if (it.kind === "sub") router.push(routes.discover({ city, cat: it.cat, sub: it.id }));
    else if (it.kind === "biz") router.push(routes.business(it.id));
    else {
      setCity(it.id);
      router.push(routes.discover({ city: it.id }));
    }
  }

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (focus && active >= 0 && flat[active]) return choose(flat[active]);
    const query = q.trim();
    const sub = query ? matchSub(query) : null;
    close();
    if (sub) router.push(routes.discover({ city, cat: sub.cat, sub: sub.id }));
    else router.push(routes.discover({ city, q: query }));
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    const n = flat.length;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocus(true);
      setActive(n ? (active + 1) % n : -1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive(n ? (active - 1 + n) % n : -1);
    } else if (e.key === "Escape") {
      setFocus(false);
      setActive(-1);
      e.currentTarget.blur();
    }
  }

  return (
    <form onSubmit={submit} role="search" className={styles.form}>
      <div className={cx(styles.bar, open && styles.barOpen)}>
        <label className={styles.field}>
          <Icon name="search" size={20} className={styles.searchIcon} />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setActive(-1);
              setFocus(true);
            }}
            onFocus={() => setFocus(true)}
            onBlur={() => {
              setFocus(false);
              setActive(-1);
            }}
            onKeyDown={onKeyDown}
            placeholder="Vad letar du efter?"
            aria-label="Vad letar du efter?"
            autoComplete="off"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={open}
            aria-controls={listId}
            aria-activedescendant={open && active >= 0 ? optionId(active) : undefined}
            className={styles.input}
          />
          {hasQ && (
            <button
              type="button"
              onClick={() => {
                setQ("");
                setActive(-1);
                inputRef.current?.focus();
              }}
              aria-label="Rensa sökningen"
              className={styles.clear}
            >
              <Icon name="x" size={14} stroke={2} />
            </button>
          )}
        </label>
        <div className={styles.group}>
          <span className={styles.divider} />
          <CityPicker variant="inline" align="right" value={city} onChange={setCity} />
          <button type="submit" className={styles.submit}>
            Sök
          </button>
        </div>
      </div>

      <div id={listId} role="listbox" aria-label="Förslag" className={cx(styles.panel, open && styles.panelOpen)}>
        {groups.map((g, gi) => (
          <div key={g.label} role="group" aria-label={g.label} className={styles.suggGroup}>
            <div aria-hidden="true" className={styles.groupLabel}>
              {g.label}
            </div>
            {g.items.map((it, ii) => {
              const i = offsets[gi] + ii;
              const sel = i === active;
              return (
                <div
                  key={it.kind + ":" + it.id}
                  id={optionId(i)}
                  role="option"
                  aria-selected={sel}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    choose(it);
                  }}
                  onMouseEnter={() => {
                    if (active !== i) setActive(i);
                  }}
                  className={cx(styles.option, sel && styles.optionActive)}
                  style={{ animationDelay: i * 22 + "ms" }}
                >
                  {it.kind === "biz" ? (
                    <span
                      className={styles.avatar}
                      style={{ "--tone": it.tone, "--tone-ink": it.toneInk } as CSSProperties}
                    >
                      {it.initials}
                    </span>
                  ) : (
                    <span className={styles.iconBox}>
                      <Icon name={it.icon} size={17} />
                    </span>
                  )}
                  <span className={styles.optionText}>
                    <span className={styles.optionLabel}>{it.label}</span>
                    <span className={styles.optionMeta}>{it.meta}</span>
                  </span>
                  <Icon name="arrow-right" size={16} className={styles.optionArrow} />
                </div>
              );
            })}
          </div>
        ))}
        {hasQ && groups.length === 0 && (
          <div className={styles.empty}>
            Inga förslag för ”{q}”. Tryck på Sök för att leta bland alla företag i {cityName}.
          </div>
        )}
        {groups.length > 0 && (
          <div className={styles.kbd} aria-hidden="true">
            <span>↑ ↓ för att välja</span>
            <span>Enter för att öppna</span>
            <span>Esc för att stänga</span>
          </div>
        )}
      </div>
    </form>
  );
}
