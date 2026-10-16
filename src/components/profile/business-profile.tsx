import Link from "next/link";
import { BusinessCard } from "@/components/business/business-card";
import { Icon } from "@/components/ui/icon";
import { related, subById } from "@/lib/data";
import { routes } from "@/lib/routes";
import type { Business } from "@/lib/types";
import { directionsHref, telHref } from "./links";
import { OpeningHours } from "./opening-hours";
import { ProfileContact } from "./profile-contact";
import { ProfileGallery } from "./profile-gallery";
import { ProfileHeader } from "./profile-header";
import { ProfileMap } from "./profile-map";
import { ProfileReviews } from "./profile-reviews";
import styles from "./business-profile.module.css";

const REVIEWS_ID = "omdomen";

/** The public profile page of a business. */
export function BusinessProfile({ biz }: { biz: Business }) {
  const sub = subById[biz.sub];
  const subHref = routes.discover({ city: biz.city, cat: biz.cat, sub: biz.sub });
  const similar = related(biz);

  return (
    <div className={styles.page}>
      <Link href={subHref} className={styles.back}>
        <Icon name="arrow-left" size={15} />
        {sub.plural} i {biz.cityName}
      </Link>

      <ProfileGallery biz={biz} />
      <ProfileHeader biz={biz} subHref={subHref} reviewsId={REVIEWS_ID} />

      <div className={styles.body}>
        <div className={styles.main}>
          <section aria-labelledby="om-foretaget">
            <h2 id="om-foretaget" className={styles.h2}>
              Om {biz.name}
            </h2>
            <p className={styles.about}>{biz.about}</p>
            <div className={styles.chips}>
              <span className={styles.chip}>
                <Icon name={biz.icon} size={14} />
                {biz.subName}
              </span>
              <span className={styles.chip}>
                <Icon name="map-pin" size={14} />
                {biz.hood}
              </span>
              <span className={styles.chip}>
                <Icon name="calendar" size={14} />
                Sedan <span>{biz.founded}</span>
              </span>
            </div>
          </section>

          <section aria-labelledby="tjanster">
            <h2 id="tjanster" className={styles.h2}>
              Tjänster och priser
            </h2>
            <ul className={styles.services}>
              {biz.services.map(([name, price, detail]) => (
                <li key={name} className={styles.service}>
                  <div className={styles.serviceInfo}>
                    <div className={styles.serviceName}>{name}</div>
                    {detail && <div className={styles.serviceDetail}>{detail}</div>}
                  </div>
                  <div className={styles.price}>{price}</div>
                </li>
              ))}
            </ul>
            <p className={styles.note}>Priserna är exempel och kan skilja sig från företagets egna.</p>
          </section>

          <ProfileReviews biz={biz} id={REVIEWS_ID} />
        </div>

        <aside className={styles.aside} aria-label="Kontakt och öppettider">
          <ProfileContact biz={biz} />
          <OpeningHours biz={biz} />
          <ProfileMap biz={biz} />
        </aside>
      </div>

      <section className={styles.related} aria-labelledby="liknande">
        <div className={styles.relatedHead}>
          <h2 id="liknande" className={styles.relatedTitle}>
            Liknande i {biz.cityName}
          </h2>
          <Link href={subHref} className={styles.all}>
            Alla <span>{sub.plural.toLowerCase()}</span>
            <Icon name="arrow-right" size={15} />
          </Link>
        </div>
        <div className={styles.grid}>
          {similar.map((b) => (
            <BusinessCard key={b.id} biz={b} compactOnMobile />
          ))}
        </div>
      </section>

      <div className={styles.bar}>
        <a href={telHref(biz)} className={styles.call}>
          <Icon name="phone" size={17} />
          Ring
        </a>
        <a href={directionsHref(biz)} target="_blank" rel="noopener" className={styles.go}>
          <Icon name="navigation" size={16} />
          Vägbeskrivning
        </a>
      </div>
    </div>
  );
}
