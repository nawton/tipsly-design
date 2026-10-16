"use client";

import Link from "next/link";
import { useCity } from "@/components/providers/app-providers";
import { Icon } from "@/components/ui/icon";
import { categories, cityById, countIn } from "@/lib/data";
import { routes } from "@/lib/routes";
import { SectionHeading } from "./section-heading";
import styles from "./category-grid.module.css";

/**
 * "Utforska kategorier": every category with its business count in the
 * visitor's city. On wide screens the heading sits in a sticky column beside
 * the tiles, which breaks the stacked rhythm of the other home sections.
 */
export function CategoryGrid() {
  const { city } = useCity();
  const cityName = cityById[city]?.name ?? "";

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.aside}>
          <SectionHeading
            className={styles.heading}
            title="Utforska kategorier."
            lead="Allt från lunchställen till rörmokare, samlat på ett ställe."
          />
          <div className={styles.total}>
            <span className={styles.totalNumber}>{countIn(city)}</span>
            <span className={styles.totalLabel}>företag i {cityName}</span>
          </div>
          <Link href={routes.discover({ city })} className={styles.all}>
            Utforska allt i {cityName}
            <Icon name="arrow-right" size={15} />
          </Link>
        </div>
        <div className={styles.grid}>
          {categories.map((k) => (
            <Link key={k.id} href={routes.discover({ city, cat: k.id })} className={styles.tile}>
              <div className={styles.top}>
                <span className={styles.iconBox}>
                  <Icon name={k.icon} size={21} />
                </span>
                <span className={styles.count}>{countIn(city, k.id)} st</span>
              </div>
              <div>
                <div className={styles.name}>{k.name}</div>
                <div className={styles.subs}>{k.subs.map((s) => s.plural).join(", ")}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
