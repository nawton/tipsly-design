"use client";

import Link from "next/link";
import { BusinessCard } from "@/components/business/business-card";
import { useCity } from "@/components/providers/app-providers";
import { Icon } from "@/components/ui/icon";
import { cityById, trending } from "@/lib/data";
import { routes } from "@/lib/routes";
import { SectionHeading } from "./section-heading";
import styles from "./trending-section.module.css";

/** "Populärt just nu": the sponsored slot plus the fastest-growing businesses in the visitor's city. */
export function TrendingSection() {
  const { city } = useCity();
  const list = trending(city);

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <SectionHeading
          title="Populärt just nu."
          lead="Företagen som får extra uppmärksamhet i din stad."
          action={
            <Link href={routes.discover({ city })} className={styles.all}>
              Visa allt i <span>{cityById[city]?.name}</span>
              <Icon name="arrow-right" size={15} />
            </Link>
          }
        />
        <div className={styles.list}>
          {list.map((b, i) => (
            <div key={b.id} className={styles.item}>
              <BusinessCard biz={b} sponsoredSlot={i === 0} />
            </div>
          ))}
        </div>
        <p className={styles.note}>
          <Icon name="info" size={15} className={styles.noteIcon} />
          <span>
            Procentsatsen visar ökningen i profilbesök de senaste sju dagarna. Sponsrade placeringar är köpta via Tipsly
            Boost och alltid märkta. Siffrorna är exempeldata.
          </span>
        </p>
      </div>
    </section>
  );
}
