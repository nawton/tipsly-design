"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCity } from "@/components/providers/app-providers";
import { cx } from "@/lib/cx";
import { cities, cityById } from "@/lib/data";
import { routes } from "@/lib/routes";
import styles from "./site-footer.module.css";

export function SiteFooter() {
  const { city } = useCity();
  const pathname = usePathname();
  const cityName = cityById[city]?.name ?? "Stockholm";
  // Profiles have a fixed action bar on phones; leave room for it.
  const roomForBar = pathname.startsWith("/foretag/");

  return (
    <footer className={styles.footer}>
      <div className={cx(styles.inner, roomForBar && styles.roomForBar)}>
        <div className={styles.grid}>
          <div className={styles.brand}>
            <Link href="/" className={styles.logo}>
              Tipsly<span className={styles.logoDot}>.</span>
            </Link>
            <p className={styles.tagline}>Lokala företag i {cities.length} svenska städer, samlade på ett ställe.</p>
          </div>
          <div className={styles.col}>
            <div className={styles.heading}>Upptäck</div>
            <Link href={routes.discover({ city })} className={styles.link}>
              Utforska {cityName}
            </Link>
            <Link href={routes.discover({ city: "goteborg" })} className={styles.link}>
              Göteborg
            </Link>
            <Link href={routes.discover({ city: "malmo" })} className={styles.link}>
              Malmö
            </Link>
            <Link href={routes.discover({ city: "uppsala" })} className={styles.link}>
              Uppsala
            </Link>
          </div>
          <div className={styles.col}>
            <div className={styles.heading}>För företag</div>
            <Link href={routes.addBusiness()} className={styles.link}>
              Lägg till ditt företag
            </Link>
            <Link href={routes.forBusiness()} className={styles.link}>
              Tipsly Boost
            </Link>
            <Link href={routes.dashboard()} className={styles.link}>
              Logga in
            </Link>
          </div>
          <div className={styles.col}>
            <div className={styles.heading}>Så rankar vi</div>
            <p className={styles.note}>
              Sponsrade placeringar är alltid märkta. Alla andra resultat sorteras efter det du väljer, och betyg går inte
              att köpa.
            </p>
          </div>
        </div>
        <div className={styles.bottom}>
          <span>© {new Date().getFullYear()} Tipsly AB</span>
          <span>Demo med påhittade exempeldata</span>
        </div>
      </div>
    </footer>
  );
}
