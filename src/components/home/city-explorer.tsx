"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { useCity } from "@/components/providers/app-providers";
import { Icon } from "@/components/ui/icon";
import { cx } from "@/lib/cx";
import { cities, cityById, countIn, featuredCities } from "@/lib/data";
import { routes } from "@/lib/routes";
import type { City } from "@/lib/types";
import { SectionHeading } from "./section-heading";
import styles from "./city-explorer.module.css";

/** Anchor for the hero's "Nu i 25 svenska städer" link. */
export const CITIES_SECTION_ID = "stader";

const coords = (c: City) =>
  c.lat.toFixed(2).replace(".", ",") + "° N  " + c.lng.toFixed(2).replace(".", ",") + "° Ö";

const featured = featuredCities.map((id) => cityById[id]);
const southToNorth = cities.slice().sort((a, b) => a.lat - b.lat);

export function CityExplorer() {
  const { city } = useCity();
  const [showAll, setShowAll] = useState(false);
  const listId = useId();

  return (
    <section id={CITIES_SECTION_ID} className={styles.section}>
      <div className={styles.inner}>
        <SectionHeading
          title="Välj din stad."
          lead="Från Malmö i söder till Luleå i norr. Välj en stad och se vad som finns runt hörnet."
          action={
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              aria-expanded={showAll}
              aria-controls={listId}
              className={styles.toggle}
            >
              {showAll ? "Visa färre städer" : "Visa alla städer"}
              <Icon name="chevron-down" size={15} className={cx(styles.chevron, showAll && styles.chevronOpen)} />
            </button>
          }
        />

        <div className={styles.grid}>
          {featured.map((c) => {
            const current = c.id === city;
            return (
              <Link key={c.id} href={routes.discover({ city: c.id })} className={cx(styles.tile, current && styles.tileCurrent)}>
                <div className={styles.tileTop}>
                  <span className={styles.coords}>{coords(c)}</span>
                  <span className={styles.arrow}>
                    <Icon name="arrow-right" size={15} />
                  </span>
                </div>
                <div>
                  <div className={styles.nameRow}>
                    <span className={styles.name}>{c.name}</span>
                    {current && <span className={styles.badge}>Din stad</span>}
                  </div>
                  <div className={styles.meta}>
                    <span className={styles.region}>{c.region} · </span>
                    {countIn(c.id)} företag
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div id={listId} className={cx(styles.all, showAll && styles.allOpen)}>
          <div className={styles.allClip}>
            <div className={styles.allCard}>
              <div className={styles.allLabel}>Alla 25 städer, från söder till norr</div>
              <div className={styles.allGrid}>
                {southToNorth.map((c) => (
                  <Link key={c.id} href={routes.discover({ city: c.id })} className={styles.allLink}>
                    <span className={styles.allName}>{c.name}</span>
                    <span className={styles.allRegion}>{c.region}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
