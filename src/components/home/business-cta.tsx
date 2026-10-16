import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { routes } from "@/lib/routes";
import { CtaBoostPreview } from "./cta-boost-preview";
import styles from "./business-cta.module.css";

/** Dark "Tipsly för företag" banner with an illustrative Boost card. */
export function BusinessCta() {
  return (
    <section className={styles.section}>
      <div className={styles.card}>
        <div>
          <div className={styles.eyebrow}>Tipsly för företag</div>
          <h2 className={styles.title}>Bli företaget fler hittar.</h2>
          <p className={styles.lead}>
            Syns gratis på Tipsly. Vill du nå fler kunder kan du boosta din placering i din kategori och stad.
          </p>
          <div className={styles.actions}>
            <Link href={routes.addBusiness()} className={styles.primary}>
              Lägg till ditt företag
            </Link>
            <Link href={routes.forBusiness()} className={styles.secondary}>
              Så fungerar Boost
              <Icon name="arrow-right" size={15} />
            </Link>
          </div>
        </div>
        <CtaBoostPreview />
      </div>
    </section>
  );
}
