"use client";

import Image from "next/image";
import Link from "next/link";
import { useCity } from "@/components/providers/app-providers";
import { Icon } from "@/components/ui/icon";
import { popularSearches } from "@/lib/data";
import { routes } from "@/lib/routes";
import heroImage from "@/assets/images/hero-street.jpg";
import { CITIES_SECTION_ID } from "./city-explorer";
import { HomeSearch } from "./home-search";
import styles from "./home-hero.module.css";

export function HomeHero() {
  const { city } = useCity();

  function toCities(e: React.MouseEvent<HTMLAnchorElement>) {
    const el = document.getElementById(CITIES_SECTION_ID);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section className={styles.hero}>
      {/* Decorative backdrop: a warm street scene, washed out behind the text and faded into the page below. */}
      <div className={styles.backdrop} aria-hidden="true">
        <Image
          src={heroImage}
          alt=""
          fill
          priority
          placeholder="blur"
          sizes="100vw"
          className={styles.backdropImage}
        />
      </div>
      <div className={styles.inner}>
        <a href={"#" + CITIES_SECTION_ID} onClick={toCities} className={styles.pill}>
          <span className={styles.dot} />
          Nu i 25 svenska städer
          <Icon name="arrow-right" size={14} />
        </a>
        <h1 className={styles.title}>Upptäck din stad med Tipsly.</h1>
        <p className={styles.lead}>
          Upptäck lokala företag, jämför dina alternativ och se vad andra tipsar om. Allt börjar i din stad.
        </p>

        <HomeSearch />

        <div className={styles.popular}>
          <span className={styles.popularLabel}>Populära sökningar</span>
          {popularSearches.map((p) => (
            <Link key={p.sub} href={routes.discover({ city, cat: p.cat, sub: p.sub })} className={styles.chip}>
              {p.label}
            </Link>
          ))}
        </div>
        <Link href={routes.discover({ city })} className={styles.cityLink}>
          Utforska min stad
          <Icon name="arrow-right" size={15} />
        </Link>
      </div>
    </section>
  );
}
