import { Icon } from "@/components/ui/icon";
import { cx } from "@/lib/cx";
import styles from "./pricing-plans.module.css";

const FREE = ["Gratis, utan tidsgräns", "Syns i sökningar och kategorier", "Statistik över besök och klick"];
const BOOST = [
  "Inga abonnemang eller bindningstid",
  "Du bestämmer själv hur mycket du budar",
  "Alltid tydligt märkt som Sponsrad",
];

export function PricingPlans() {
  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        <article className={styles.card}>
          <span className={styles.icon}>
            <Icon name="store" size={22} />
          </span>
          <h2 className={styles.title}>Börja gratis</h2>
          <p className={styles.text}>
            Skapa en profil med bilder, tjänster och öppettider. Den syns i din stad och kategori direkt, utan kostnad.
          </p>
          <ul className={styles.list}>
            {FREE.map((t) => (
              <li key={t} className={styles.item}>
                <Icon name="check" size={16} stroke={2.25} className={styles.check} />
                {t}
              </li>
            ))}
          </ul>
          <div className={styles.price}>
            <span className={styles.amount}>0 kr</span>
            <span className={styles.unit}>för alltid</span>
          </div>
        </article>

        <article className={cx(styles.card, styles.dark)}>
          <span className={styles.icon}>
            <Icon name="zap" size={22} />
          </span>
          <h2 className={styles.title}>Öka din synlighet med Boost</h2>
          <p className={styles.text}>
            Buda på en tillfällig topplacering i din kategori och stad när du vill nå fler. Du betalar bara om du
            vinner.
          </p>
          <ul className={styles.list}>
            {BOOST.map((t) => (
              <li key={t} className={styles.item}>
                <Icon name="check" size={16} stroke={2.25} className={styles.check} />
                {t}
              </li>
            ))}
          </ul>
          <div className={styles.price}>
            <span className={styles.amount}>från 500 kr</span>
            <span className={styles.unit}>per vecka, exkl. moms</span>
          </div>
        </article>
      </div>
    </section>
  );
}
