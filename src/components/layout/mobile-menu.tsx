"use client";

import Link from "next/link";
import { useEffect, useRef, type CSSProperties, type RefObject } from "react";
import { Icon } from "@/components/ui/icon";
import { cx } from "@/lib/cx";
import { categories } from "@/lib/data";
import { routes } from "@/lib/routes";
import styles from "./mobile-menu.module.css";

export const MOBILE_MENU_ID = "mobilmeny";

type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
  /** Distance from the top of the viewport to the bottom of the header, in px. */
  top: number;
  city: string;
  cityName: string;
  /** The header's menu button, which gets focus back when Escape closes the menu. */
  toggleRef: RefObject<HTMLButtonElement | null>;
};

/**
 * Full-screen navigation for phones and tablets. It sits just below the
 * header (which stays usable: logo, city, saved, close), covers the rest of
 * the page, locks page scrolling and makes the page behind inert while open.
 * It stays mounted when closed so it can fade out as smoothly as it fades in.
 */
export function MobileMenu({ open, onClose, top, city, cityName, toggleRef }: MobileMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";

    // Everything next to the header and the menu (banner, page, footer) goes inert.
    const menu = ref.current;
    const behind = Array.from(menu?.parentElement?.children ?? []).filter(
      (el) => el !== menu && el.tagName !== "HEADER",
    );
    behind.forEach((el) => el.setAttribute("inert", ""));

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      onClose();
      toggleRef.current?.focus();
    };
    // Rotating a tablet past the desktop breakpoint hides the menu: close it properly.
    const desktop = window.matchMedia("(min-width: 1000px)");
    const onDesktop = () => desktop.matches && onClose();

    document.addEventListener("keydown", onKey);
    desktop.addEventListener("change", onDesktop);
    return () => {
      root.style.overflow = previousOverflow;
      behind.forEach((el) => el.removeAttribute("inert"));
      document.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onDesktop);
    };
  }, [open, onClose, toggleRef]);

  // Staggered entrance: each block gets its index as --i.
  const step = (i: number) => ({ "--i": i }) as CSSProperties;

  return (
    <div
      ref={ref}
      id={MOBILE_MENU_ID}
      inert={!open}
      className={cx(styles.overlay, open && styles.open)}
      style={{ "--menu-top": `${top}px` } as CSSProperties}
    >
      <div className={styles.inner}>
        <nav aria-label="Mobilmeny" className={styles.nav}>
          {[
            { href: routes.discover({ city }), label: `Utforska ${cityName}` },
            { href: routes.forBusiness(), label: "För företag" },
            { href: routes.dashboard(), label: "Mitt företag" },
          ].map((l, i) => (
            <Link key={l.href} href={l.href} onClick={onClose} className={cx(styles.item, styles.link)} style={step(i)}>
              {l.label}
              <Icon name="chevron-right" size={20} className={styles.chevron} />
            </Link>
          ))}
        </nav>

        <div className={cx(styles.item, styles.label)} style={step(3)}>
          Kategorier i {cityName}
        </div>
        <div className={cx(styles.item, styles.cats)} style={step(4)}>
          {categories.map((c) => (
            <Link key={c.id} href={routes.discover({ city, cat: c.id })} onClick={onClose} className={styles.cat}>
              <Icon name={c.icon} size={17} />
              {c.name}
            </Link>
          ))}
        </div>

        <Link href={routes.addBusiness()} onClick={onClose} className={cx(styles.item, styles.cta)} style={step(5)}>
          Lägg till ditt företag
        </Link>
      </div>
    </div>
  );
}
