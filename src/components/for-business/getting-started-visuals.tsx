import Image from "next/image";
import { Icon } from "@/components/ui/icon";
import { cx } from "@/lib/cx";
import styles from "./getting-started-visuals.module.css";

/*
 * Small, static illustrations of what each step looks like in the product.
 * They are decorative (the step text says the same thing) and hidden from
 * assistive technology by the caller.
 */

export function SignupStepVisual() {
  return (
    <div className={styles.stage}>
      <div className={styles.card}>
        <div className={styles.cardTitle}>Lägg till ditt företag</div>
        <div className={styles.fieldLabel}>Företagets namn</div>
        <div className={cx(styles.field, styles.fieldFocus)}>
          Salong Linnea<span className={styles.caret} />
        </div>
        <div className={styles.fieldRow}>
          <div className={styles.field}>
            Frisörer & skönhet
            <Icon name="chevron-down" size={14} className={styles.fieldIcon} />
          </div>
          <div className={styles.field}>
            Malmö
            <Icon name="chevron-down" size={14} className={styles.fieldIcon} />
          </div>
        </div>
        <div className={styles.field}>linnea@salonglinnea.se</div>
        <div className={styles.button}>Skapa gratis profil</div>
      </div>
      <div className={cx(styles.badge, styles.badgeTop)}>
        <Icon name="shield-check" size={15} />
        Organisationsnummer verifierat
      </div>
    </div>
  );
}

const RESULTS = [
  { name: "Studio Björk", meta: "Frisör · Möllevången", rating: "4,7", photo: "/images/categories/storefront-2.jpg" },
  { name: "Salong Linnea", meta: "Frisör · Davidshall", rating: "4,9", photo: "/images/categories/storefront-1.jpg", you: true },
  { name: "Klippoteket", meta: "Frisör · Limhamn", rating: "4,8", photo: "/images/categories/storefront-2.jpg" },
];

export function ListingStepVisual() {
  return (
    <div className={styles.stage}>
      <div className={styles.card}>
        <div className={styles.search}>
          <Icon name="search" size={15} className={styles.fieldIcon} />
          frisör
          <span className={styles.searchCity}>
            <Icon name="map-pin" size={13} />
            Malmö
          </span>
        </div>
        <div className={styles.results}>
          {RESULTS.map((r) => (
            <div key={r.name} className={cx(styles.result, r.you && styles.resultYou)}>
              <Image src={r.photo} alt="" width={44} height={44} className={styles.thumb} />
              <div className={styles.resultText}>
                <div className={styles.resultName}>
                  {r.name}
                  {r.you && <span className={styles.you}>Din profil</span>}
                </div>
                <div className={styles.resultMeta}>{r.meta}</div>
              </div>
              <div className={styles.rating}>
                <Icon name="star" size={13} fill="currentColor" className={styles.star} />
                {r.rating}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={cx(styles.badge, styles.badgeBottom)}>
        <Icon name="eye" size={15} />
        128 profilbesök den här veckan
      </div>
    </div>
  );
}

export function BoostStepVisual() {
  return (
    <div className={styles.stage}>
      <div className={styles.card}>
        <div className={styles.boostHead}>
          <div>
            <div className={styles.small}>Topplacering · nästa vecka</div>
            <div className={styles.boostMarket}>Frisörer & skönhet, Malmö</div>
          </div>
          <span className={styles.leading}>
            <Icon name="circle-check" size={14} />
            Du leder
          </span>
        </div>
        <div className={styles.small}>Ledande bud</div>
        <div className={styles.amount}>1 450 kr</div>
        <div className={styles.progress}>
          <span />
        </div>
        <div className={styles.small}>3 bud · budgivningen stänger söndag kl. 20:00</div>
      </div>
      <div className={cx(styles.badge, styles.badgeBottom, styles.sponsored)}>
        <span className={styles.sponsoredChip}>Sponsrad</span>
        Salong Linnea visas överst i hela veckan
      </div>
    </div>
  );
}
