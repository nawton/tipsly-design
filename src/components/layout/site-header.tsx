"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useRef, useState, useSyncExternalStore } from "react";
import { useCity, useSaved } from "@/components/providers/app-providers";
import { CityPicker } from "@/components/ui/city-picker";
import { Icon } from "@/components/ui/icon";
import { useDismiss } from "@/hooks/use-dismiss";
import { cx } from "@/lib/cx";
import { byId, categories, cities, cityById } from "@/lib/data";
import { routes } from "@/lib/routes";
import { MOBILE_MENU_ID, MobileMenu } from "./mobile-menu";
import styles from "./site-header.module.css";

type Menu = "cats" | "cities" | "saved" | null;

function subscribeScroll(cb: () => void) {
  window.addEventListener("scroll", cb, { passive: true });
  return () => window.removeEventListener("scroll", cb);
}
const getScrolled = () => window.scrollY > 8;
const getScrolledServer = () => false;

export function SiteHeader() {
  const pathname = usePathname();
  const { city, setCity } = useCity();
  const { saved, toggleSave } = useSaved();
  const [menu, setMenu] = useState<Menu>(null);
  const [sheet, setSheet] = useState(false);
  const [menuTop, setMenuTop] = useState(0);
  const scrolled = useSyncExternalStore(subscribeScroll, getScrolled, getScrolledServer);
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Close everything when the route changes.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMenu(null);
    setSheet(false);
  }

  const closeMenus = useCallback(() => setMenu(null), []);
  useDismiss(headerRef, menu !== null, closeMenus);
  const closeSheet = useCallback(() => setSheet(false), []);

  function toggleSheet() {
    if (!sheet) setMenuTop(headerRef.current?.getBoundingClientRect().bottom ?? 0);
    setSheet(!sheet);
    setMenu(null);
  }

  const toggle = (m: Exclude<Menu, null>) => setMenu((cur) => (cur === m ? null : m));

  const cityName = cityById[city]?.name ?? "Stockholm";
  const exploreHref = routes.discover({ city });
  const onDiscover = pathname.startsWith("/utforska");
  const onBusiness = pathname.startsWith("/for-foretag");

  const savedList = Object.keys(saved)
    .sort((a, b) => saved[b] - saved[a])
    .map((id) => byId[id])
    .filter(Boolean);
  const count = savedList.length;

  return (
    <>
      <header ref={headerRef} className={cx(styles.header, scrolled && styles.solid, sheet && styles.menuOpen)}>
        <div className={cx(styles.bar, scrolled && styles.barScrolled)}>
          <Link href="/" aria-label="Tipsly, till startsidan" className={styles.logo}>
            Tipsly<span className={styles.logoDot}>.</span>
          </Link>

          <nav aria-label="Huvudmeny" className={cx(styles.nav, styles.desktopOnly)}>
            <Link href={exploreHref} className={cx(styles.navItem, onDiscover && styles.navItemActive)}>
              Utforska
            </Link>

            <div className={styles.menuWrap}>
              <button
                type="button"
                onClick={() => toggle("cats")}
                aria-expanded={menu === "cats"}
                aria-haspopup="true"
                className={cx(styles.navItem, styles.navButton, menu === "cats" && styles.navItemActive)}
              >
                Kategorier
                <Icon
                  name="chevron-down"
                  size={14}
                  className={cx(styles.chevron, menu === "cats" && styles.chevronOpen)}
                />
              </button>
              <div className={cx(styles.panel, styles.catsPanel, menu === "cats" && styles.panelOpen)}>
                <div className={styles.catsGrid}>
                  {categories.map((c) => (
                    <Link key={c.id} href={routes.discover({ city, cat: c.id })} className={styles.catLink}>
                      <span className={styles.catIcon}>
                        <Icon name={c.icon} size={18} />
                      </span>
                      <span className={styles.catText}>
                        <span className={styles.catName}>{c.name}</span>
                        <span className={styles.catBlurb}>{c.blurb}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.menuWrap}>
              <button
                type="button"
                onClick={() => toggle("cities")}
                aria-expanded={menu === "cities"}
                aria-haspopup="true"
                className={cx(styles.navItem, styles.navButton, menu === "cities" && styles.navItemActive)}
              >
                Städer
                <Icon
                  name="chevron-down"
                  size={14}
                  className={cx(styles.chevron, menu === "cities" && styles.chevronOpen)}
                />
              </button>
              <div className={cx(styles.panel, styles.citiesPanel, menu === "cities" && styles.panelOpen)}>
                <div className={styles.citiesHint}>Tipsly finns i {cities.length} städer</div>
                <div className={styles.citiesGrid}>
                  {cities.map((c) => (
                    <Link
                      key={c.id}
                      href={routes.discover({ city: c.id })}
                      className={cx(styles.cityLink, c.id === city && styles.cityLinkCurrent)}
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <Link href={routes.forBusiness()} className={cx(styles.navItem, onBusiness && styles.navItemActive)}>
              För företag
            </Link>
          </nav>

          <div className={styles.spacer} />

          <CityPicker variant="nav" align="right" value={city} onChange={setCity} />

          <div className={styles.menuWrap}>
            <button
              type="button"
              onClick={() => toggle("saved")}
              aria-label={count ? `Sparade företag, ${count} st` : "Sparade företag"}
              aria-expanded={menu === "saved"}
              className={cx(styles.iconButton, menu === "saved" && styles.iconButtonActive)}
            >
              <Icon name="bookmark" size={18} />
              {count > 0 && <span className={styles.badge}>{count}</span>}
            </button>
            <div className={cx(styles.panel, styles.savedPanel, menu === "saved" && styles.panelOpen)}>
              <div className={styles.savedHead}>
                <span className={styles.savedTitle}>Sparade</span>
                <span className={styles.savedCount}>{count === 1 ? "1 företag" : count + " företag"}</span>
              </div>
              {count > 0 ? (
                <div className={styles.savedList}>
                  {savedList.map((b) => (
                    <div key={b.id} className={styles.savedRow}>
                      <Link href={b.href} className={styles.savedLink}>
                        <span className={styles.savedAvatar} style={{ background: b.tone, color: b.toneInk }}>
                          {b.initials}
                        </span>
                        <span className={styles.savedText}>
                          <span className={styles.savedName}>{b.name}</span>
                          <span className={styles.savedMeta}>
                            {b.subName} · {b.place}
                          </span>
                        </span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => toggleSave(b.id)}
                        aria-label={`Ta bort ${b.name} från sparade`}
                        className={styles.savedRemove}
                      >
                        <Icon name="x" size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.savedEmpty}>
                  <span className={styles.savedEmptyIcon}>
                    <Icon name="bookmark" size={20} />
                  </span>
                  <span className={styles.savedEmptyTitle}>Inga sparade företag än</span>
                  <span className={styles.savedEmptyText}>Tryck på bokmärket på ett företag så samlas det här.</span>
                </div>
              )}
            </div>
          </div>

          <Link href={routes.addBusiness()} className={cx(styles.cta, styles.desktopOnly)}>
            Lägg till ditt företag
          </Link>

          <button
            ref={toggleRef}
            type="button"
            onClick={toggleSheet}
            aria-label={sheet ? "Stäng menyn" : "Öppna menyn"}
            aria-expanded={sheet}
            aria-controls={MOBILE_MENU_ID}
            className={cx(styles.iconButton, styles.compactOnly)}
          >
            <span aria-hidden="true" className={cx(styles.burger, sheet && styles.burgerOpen)}>
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>
      </header>
      <MobileMenu
        open={sheet}
        onClose={closeSheet}
        top={menuTop}
        city={city}
        cityName={cityName}
        toggleRef={toggleRef}
      />
    </>
  );
}
