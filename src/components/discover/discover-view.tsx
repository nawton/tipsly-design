"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useCity } from "@/components/providers/app-providers";
import { CityPicker } from "@/components/ui/city-picker";
import { Icon } from "@/components/ui/icon";
import { useNow } from "@/hooks/use-now";
import { cx } from "@/lib/cx";
import { cityById, DEFAULT_CITY, query, sorts } from "@/lib/data";
import { routes } from "@/lib/routes";
import type { SortId } from "@/lib/types";
import { FilterBar } from "./discover-filters";
import { MapView } from "./discover-map";
import { ResultsGrid, SponsoredSection } from "./discover-results";
import { discoverBlurb, discoverHeading, discoverHref, resolveDiscover } from "./discover-route";
import { ResultsSkeleton, StateActions, StateCard, stateStyles } from "./discover-states";
import { CategoryChips, SearchField, SortMenu, SubcategoryChips, ViewToggle } from "./discover-toolbar";
import { useDiscoverQuery } from "./use-discover-query";
import styles from "./discover-view.module.css";

const PAGE_SIZE = 12;
const SEARCH_DEBOUNCE_MS = 260;

/** The page container, also used by the route's fallback states. */
export function DiscoverFrame({ children }: { children: ReactNode }) {
  return <div className={styles.page}>{children}</div>;
}

type DiscoverViewProps = {
  city: string;
  cat?: string | null;
  sub?: string | null;
  /** Set by loading.tsx and error.tsx: replaces the results with a skeleton or an error panel. */
  status?: "loading" | "error";
  onRetry?: () => void;
};

/** The listing ("Utforska"): heading, toolbar, filters and the results as a grid or a map. */
export function DiscoverView({ city: cityId, cat: catId, sub: subId, status, onRetry }: DiscoverViewProps) {
  const route = resolveDiscover(cityId, [catId, subId].filter((s): s is string => !!s)) ?? {
    city: cityById[DEFAULT_CITY],
    cat: null,
    sub: null,
  };
  const { city, cat, sub } = route;
  const { setCity } = useCity();
  const [view, update] = useDiscoverQuery();
  const { q, sort, openNow, topRated, isMap, keep } = view;
  const now = useNow();

  const res = query({ city: city.id, cat: cat?.id, sub: sub?.id, q, sort, openNow, topRated, now: openNow ? now : null });
  const sortLabel = (sorts.find((s) => s.id === sort) ?? sorts[0]).label;
  const heading = discoverHeading(route, q);

  // Search text: typed locally, applied to the URL after a short pause.
  const [text, setText] = useState(q);
  const [ownQ, setOwnQ] = useState(q);

  // "Visa fler" and the map hover reset whenever the result set changes.
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [hover, setHover] = useState<string | null>(null);
  const listKey = [city.id, cat?.id, sub?.id, q, openNow, topRated].join("|");
  const [seen, setSeen] = useState({ listKey, q });
  if (seen.listKey !== listKey) {
    setSeen({ listKey, q });
    setLimit(PAGE_SIZE);
    setHover(null);
    // The URL changed from outside (e.g. the header search): show the new query.
    if (q !== seen.q && q !== ownQ) setText(q);
  }

  // Results fade out and slide back in when the visitor changes the listing.
  const [fading, setFading] = useState(false);
  const fadeTimer = useRef(0);
  const debounceTimer = useRef(0);
  useEffect(
    () => () => {
      window.clearTimeout(fadeTimer.current);
      window.clearTimeout(debounceTimer.current);
    },
    [],
  );
  const refresh = useCallback(() => {
    window.clearTimeout(fadeTimer.current);
    setFading(true);
    fadeTimer.current = window.setTimeout(() => setFading(false), 40);
  }, []);

  const [sortOpen, setSortOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const onSortOpenChange = useCallback((open: boolean) => {
    setSortOpen(open);
    setInfoOpen(false);
  }, []);
  const onInfoOpenChange = useCallback((open: boolean) => {
    setInfoOpen(open);
    setSortOpen(false);
  }, []);

  useEffect(() => {
    document.title = heading + " · Tipsly";
  }, [heading]);

  function apply(value: string) {
    window.clearTimeout(debounceTimer.current);
    setOwnQ(value);
    const current = (new URLSearchParams(window.location.search).get("q") ?? "").trim();
    if (value === current) return;
    refresh();
    update({ q: value || null });
  }

  function onSearchChange(value: string) {
    setText(value);
    window.clearTimeout(debounceTimer.current);
    debounceTimer.current = window.setTimeout(() => apply(value.trim()), SEARCH_DEBOUNCE_MS);
  }

  function clearSearch() {
    setText("");
    apply("");
  }

  function pickSort(id: SortId) {
    setSortOpen(false);
    refresh();
    update({ sortera: id });
  }

  function setMap(map: boolean) {
    refresh();
    update({ vy: map ? "karta" : null });
  }

  function clearAll() {
    window.clearTimeout(debounceTimer.current);
    setText("");
    setOwnQ("");
    refresh();
    update({ q: null, sortera: null, oppet: null, betyg: null });
  }

  const cityHref = discoverHref({ city: city.id }, keep);
  const hasResults = !status && res.total > 0;

  return (
    <div className={styles.page}>
      <nav aria-label="Brödsmulor" className={styles.crumbs}>
        <Link href={routes.home()} className={styles.crumb}>
          Tipsly
        </Link>
        <Icon name="chevron-right" size={13} />
        <Link href={cityHref} className={styles.crumb}>
          {city.name}
        </Link>
        {cat && (
          <>
            <Icon name="chevron-right" size={13} />
            <Link href={discoverHref({ city: city.id, cat: cat.id }, keep)} className={styles.crumb}>
              {cat.name}
            </Link>
          </>
        )}
        {sub && (
          <>
            <Icon name="chevron-right" size={13} />
            <span className={styles.crumbCurrent}>{sub.plural}</span>
          </>
        )}
      </nav>

      <header className={styles.header}>
        <h1 className={styles.title}>{heading}</h1>
        <p className={styles.blurb}>{discoverBlurb(route)}</p>
      </header>

      <div className={styles.toolbar}>
        <div className={styles.controls}>
          <SearchField
            value={text}
            placeholder={"Sök i " + city.name}
            onChange={onSearchChange}
            onSubmit={() => apply(text.trim())}
            onClear={clearSearch}
          />
          <CityPicker variant="field" block="mobile" value={city.id} onChange={setCity} />
          <SortMenu value={sort} open={sortOpen} onOpenChange={onSortOpenChange} onPick={pickSort} />
          <ViewToggle isMap={isMap} onChange={setMap} />
        </div>
      </div>

      <CategoryChips city={city.id} cat={cat} keep={keep} />

      <SubcategoryChips city={city.id} cat={cat} sub={sub} keep={keep} />

      <FilterBar
        openNow={openNow}
        topRated={topRated}
        onToggleOpen={() => {
          refresh();
          update({ oppet: openNow ? null : "1" });
        }}
        onToggleTop={() => {
          refresh();
          update({ betyg: topRated ? null : "1" });
        }}
        onClear={() => {
          refresh();
          update({ oppet: null, betyg: null });
        }}
        total={res.total}
        infoOpen={infoOpen}
        onInfoOpenChange={onInfoOpenChange}
      />

      <div className={styles.results}>
        {status === "loading" && <ResultsSkeleton />}

        {status === "error" && (
          <StateCard
            alert
            icon="wifi-off"
            tone="danger"
            title="Det gick inte att hämta resultaten."
            text="Kontrollera din anslutning och försök igen. Dina filter finns kvar."
          >
            <button type="button" onClick={onRetry} className={stateStyles.retry}>
              <Icon name="refresh-cw" size={16} />
              Försök igen
            </button>
          </StateCard>
        )}

        {!status && res.total === 0 && (
          <StateCard
            icon="search-x"
            balance
            title={q ? "Inga träffar för ”" + q + "” i " + city.name + "." : "Inga företag matchar dina filter."}
            text="Prova ett annat sökord, ta bort ett filter eller titta i en annan stad."
          >
            <StateActions>
              <button type="button" onClick={clearAll} className={stateStyles.primary}>
                Rensa sökning och filter
              </button>
              <Link href={cityHref} className={stateStyles.secondary}>
                Visa allt i {city.name}
              </Link>
            </StateActions>
          </StateCard>
        )}

        {hasResults && (
          <div className={cx(styles.fade, fading && styles.fading)}>
            {res.sponsored && <SponsoredSection biz={res.sponsored} />}
            {isMap ? (
              <MapView items={res.results} city={city} sortLabel={sortLabel} hover={hover} onHover={setHover} />
            ) : (
              <ResultsGrid
                items={res.results.slice(0, limit)}
                total={res.total}
                sortLabel={sortLabel}
                onMore={() => setLimit(limit + PAGE_SIZE)}
              />
            )}
          </div>
        )}
      </div>

      {hasResults && (
        <button type="button" onClick={() => setMap(!isMap)} className={styles.pill}>
          <Icon name={isMap ? "layout-grid" : "map"} size={17} />
          {isMap ? "Visa lista" : "Visa karta"}
        </button>
      )}
    </div>
  );
}
