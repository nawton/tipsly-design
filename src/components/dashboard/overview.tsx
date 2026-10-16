"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Icon, type IconName } from "@/components/ui/icon";
import { useNow } from "@/hooks/use-now";
import { cx } from "@/lib/cx";
import { kr, nf, owner, periods } from "@/lib/data";
import { routes } from "@/lib/routes";
import { useDashboard } from "./dashboard-context";
import { TabSection } from "./dashboard-ui";
import styles from "./overview.module.css";

/** "Översikt": greeting, key figures, visits chart, ranking and Boost status. */
export function Overview() {
  const now = useNow();
  const { biz, businessName, account, boost } = useDashboard();
  const p = periods(now);
  const rank = useMemo(() => ({ popular: owner.rank("popular"), rating: owner.rank("rating") }), []);

  const status = {
    idle: {
      label: "Inget bud",
      icon: "circle-dashed" as IconName,
      className: styles.statusIdle,
      text: `Du har inte lagt något bud för vecka ${p.next.week}. Budgivningen stänger ${p.closesText}.`,
    },
    leading: {
      label: "Du leder",
      icon: "circle-check" as IconName,
      className: styles.statusLeading,
      text: `Ditt bud på ${kr(boost.myBid || 0)} leder. Om ingen bjuder över dig när budgivningen stänger ${p.closesText} vinner du placeringen.`,
    },
    outbid: {
      label: "Överbjuden",
      icon: "circle-alert" as IconName,
      className: styles.statusOutbid,
      text: `Någon har bjudit över ditt bud på ${kr(boost.myBid || 0)}. Höj budet om du vill ta tillbaka ledningen.`,
    },
  }[boost.phase];

  return (
    <TabSection>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Hej {account.name.split(" ")[0]}.</h1>
          <p className={styles.lead}>Så har det gått för {businessName} de senaste 30 dagarna.</p>
        </div>
        <span title="Riktig statistik visas när kontot är kopplat" className={styles.sampleChip}>
          <Icon name="info" size={14} />
          Exempeldata
        </span>
      </header>

      <VisitStats now={now} boostWeek={p.past[0].week} />

      <div className={styles.cards}>
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Din placering</h2>
          <div className={styles.big}>
            <span className={styles.bigValue}>#{rank.popular.rank}</span>
            <span className={styles.bigNote}>
              av {rank.popular.of} i {biz.catName}, {biz.cityName}
            </span>
          </div>
          <div className={styles.rankList}>
            <div className={styles.rankRow}>
              <span className={styles.rankLabel}>Sorterat på Populärast</span>
              <span className={styles.rankValue}>#{rank.popular.rank}</span>
            </div>
            <div className={styles.rankRow}>
              <span className={styles.rankLabel}>Sorterat på Högst betyg</span>
              <span className={styles.rankValue}>#{rank.rating.rank}</span>
            </div>
          </div>
          <p className={styles.footnote}>
            Den organiska placeringen räknas fram av besök, betyg och omdömen. Boost påverkar den inte.
          </p>
        </section>

        <section className={styles.card}>
          <div className={styles.boostHead}>
            <h2 className={styles.cardTitle}>Tipsly Boost</h2>
            <span className={cx(styles.status, status.className)}>
              <Icon name={status.icon} size={14} />
              {status.label}
            </span>
          </div>
          <div className={styles.big}>
            <span className={cx(styles.bigValue, styles.tabular)}>{kr(boost.leading)}</span>
            <span className={styles.bigNote}>ledande bud, vecka {p.next.week}</span>
          </div>
          <p className={styles.boostText}>{status.text}</p>
          <Link href={routes.dashboard("boost")} className={styles.boostLink}>
            Gå till Boost
            <Icon name="arrow-right" size={15} />
          </Link>
        </section>
      </div>
    </TabSection>
  );
}

/** KPI cards and the 30-day visits chart. */
function VisitStats({ now, boostWeek }: { now: Date; boostWeek: number }) {
  const stats = useMemo(() => owner.stats(now), [now]);
  const max = Math.max(...stats.days.map((d) => d.value));
  const total = stats.days.reduce((sum, d) => sum + d.value, 0);

  // Bars grow from zero each time the tab opens.
  const [grown, setGrown] = useState(false);
  const [hover, setHover] = useState(-1);
  useEffect(() => {
    const t = window.setTimeout(() => setGrown(true), 80);
    return () => window.clearTimeout(t);
  }, []);

  const hovered = hover >= 0 ? stats.days[hover] : null;

  return (
    <>
      <div className={styles.kpis}>
        {stats.kpis.map((k) => (
          <div key={k.label} className={styles.kpi}>
            <span className={styles.kpiLabel}>
              <Icon name={k.icon} size={16} />
              {k.label}
            </span>
            <span className={styles.kpiValue}>{k.value}</span>
            <span className={styles.kpiDelta}>
              <span className={k.up ? styles.deltaUp : styles.deltaDown}>{k.delta}</span> mot föregående 30 dagar
            </span>
          </div>
        ))}
      </div>

      <section className={styles.chartCard}>
        <div className={styles.chartHead}>
          <h2 className={styles.cardTitle}>Profilbesök per dag</h2>
          <span aria-live="polite" className={styles.chartLabel}>
            {hovered ? `${hovered.label} · ${hovered.value} besök` : `Totalt ${nf(total)} besök`}
          </span>
        </div>
        <div
          role="img"
          aria-label={`Stapeldiagram över profilbesök per dag från ${stats.days[0].label} till ${stats.days[stats.days.length - 1].label}`}
          onMouseLeave={() => setHover(-1)}
          className={cx(styles.chart, grown && styles.chartGrown, hover >= 0 && styles.chartHovering)}
        >
          {stats.days.map((d, i) => (
            <div
              key={d.label}
              onMouseEnter={() => setHover(i)}
              className={styles.barSlot}
              style={
                {
                  "--h": Math.max(4, Math.round((d.value / max) * 100)) + "%",
                  "--delay": i * 14 + "ms",
                } as CSSProperties
              }
            >
              <div className={cx(styles.bar, d.boosted && styles.barBoosted, hover === i && styles.barActive)} />
            </div>
          ))}
        </div>
        <div className={styles.axis}>
          <span>{stats.days[0].label}</span>
          <span>{stats.days[stats.days.length - 1].label}</span>
        </div>
        <div className={styles.legend}>
          <span className={styles.legendItem}>
            <span className={cx(styles.swatch, styles.swatchBoost)} />
            {/* The week number is its own flex item, spaced by the gap as in the design. */}
            Vecka <span>{boostWeek}</span> med Tipsly Boost
          </span>
          <span className={styles.legendItem}>
            <span className={styles.swatch} />
            Övriga dagar
          </span>
        </div>
      </section>
    </>
  );
}
