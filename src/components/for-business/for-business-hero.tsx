import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { routes } from "@/lib/routes";
import { ScrollToFormButton } from "./scroll-to-form-button";
import styles from "./for-business-hero.module.css";

export function ForBusinessHero() {
  return (
    <section className={styles.hero}>
      <div className={styles.inner}>
        <span className={styles.pill}>Tipsly för företag</span>
        <h1 className={styles.title}>Bli företaget fler hittar.</h1>
        <p className={styles.lead}>
          Syns gratis på Tipsly. Vill du nå fler kunder kan du boosta din placering i din kategori och stad.
        </p>
        <div className={styles.actions}>
          <ScrollToFormButton className={styles.primary}>Lägg till ditt företag</ScrollToFormButton>
          <Link href={routes.dashboard()} className={styles.secondary}>
            Logga in
            <Icon name="arrow-right" size={16} />
          </Link>
        </div>
        <span className={styles.note}>Demokontot är förifyllt med en påhittad frisörsalong i Malmö.</span>
      </div>
    </section>
  );
}
