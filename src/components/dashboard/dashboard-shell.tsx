"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { Icon, type IconName } from "@/components/ui/icon";
import { cx } from "@/lib/cx";
import { routes, type DashboardTab } from "@/lib/routes";
import { useDashboard } from "./dashboard-context";
import styles from "./dashboard-shell.module.css";

const TABS: { id: DashboardTab; label: string; icon: IconName }[] = [
  { id: "oversikt", label: "Översikt", icon: "layout-dashboard" },
  { id: "profil", label: "Företagsprofil", icon: "store" },
  { id: "boost", label: "Tipsly Boost", icon: "zap" },
  { id: "installningar", label: "Inställningar", icon: "settings" },
];

/** "Mitt företag": the aside with the business and tab navigation, next to the open tab. */
export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { biz, businessName, logo, account, boost } = useDashboard();
  const navRef = useRef<HTMLElement>(null);


  // Phones show the tabs as a scrolling row: keep the current one in view.
  useEffect(() => {
    const nav = navRef.current;
    const current = nav?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!nav || !current || nav.scrollWidth <= nav.clientWidth) return;
    const left = current.offsetLeft - nav.offsetLeft;
    if (left < nav.scrollLeft || left + current.offsetWidth > nav.scrollLeft + nav.clientWidth) {
      nav.scrollTo({ left: Math.max(0, left - 4) });
    }
  }, [pathname]);

  return (
    <div className={styles.layout}>
      <aside className={styles.aside}>
        <div className={styles.brand}>
          {logo ? (
            <Image src={logo} alt="Logotyp" width={44} height={44} unoptimized className={styles.logo} />
          ) : (
            <span className={styles.initials} style={{ "--tone-ink": biz.toneInk } as CSSProperties}>
              {biz.initials}
            </span>
          )}
          <div className={styles.brandText}>
            <div className={styles.brandName}>{businessName}</div>
            <div className={styles.brandMeta}>
              {biz.subName} · {biz.cityName}
            </div>
          </div>
        </div>

        <nav ref={navRef} aria-label="Dashboard" className={styles.nav}>
          {TABS.map((t) => {
            const href = routes.dashboard(t.id);
            const current = pathname === href;
            const dot = t.id === "boost" && boost.phase !== "idle";
            return (
              <Link
                key={t.id}
                href={href}
                aria-current={current ? "page" : undefined}
                className={cx(styles.tab, current && styles.tabCurrent)}
              >
                <Icon name={t.icon} size={18} />
                <span className={styles.tabLabel}>{t.label}</span>
                {dot && (
                  <span className={cx(styles.dot, boost.phase === "outbid" && styles.dotOutbid)}>
                    <span className="visually-hidden">{boost.phase === "leading" ? " (du leder)" : " (överbjuden)"}</span>
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className={styles.asideFoot}>
          <Link href={routes.business(biz.id)} className={styles.publicLink}>
            Visa publik profil
            <Icon name="arrow-up-right" size={15} />
          </Link>
          <span className={styles.note}>Inloggad som {account.name}. Demokonto med påhittade uppgifter.</span>
        </div>
      </aside>

      <div className={styles.content}>{children}</div>
    </div>
  );
}
