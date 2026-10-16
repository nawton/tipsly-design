import { Icon, type IconName } from "@/components/ui/icon";
import { BoostAuctionPreview } from "./boost-auction-preview";
import styles from "./boost-explainer.module.css";

const RULES: { icon: IconName; text: string }[] = [
  { icon: "calendar", text: "Placeringen gäller en vecka i taget, måndag till söndag." },
  { icon: "gavel", text: "Budgivningen stänger söndag kl. 20:00. Högsta behöriga bud vinner." },
  { icon: "receipt", text: "Minsta bud är 500 kr. Du betalar ditt bud bara om du vinner." },
  { icon: "eye", text: "Du ser ledande bud och konkurrenternas belopp, men inte vilka de är." },
  { icon: "tag", text: "Placeringen märks alltid Sponsrad och påverkar inte organiska resultat eller betyg." },
];

/** "Så fungerar Tipsly Boost": the auction rules next to an illustrative bidding card. */
export function BoostExplainer() {
  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        <div>
          <h2 className={styles.title}>Så fungerar Tipsly Boost.</h2>
          <p className={styles.lead}>
            Varje kategori i varje stad har en sponsrad topplacering. Den går till det högsta behöriga budet för veckan.
          </p>
          <ul className={styles.rules}>
            {RULES.map((r) => (
              <li key={r.icon} className={styles.rule}>
                <Icon name={r.icon} size={18} className={styles.ruleIcon} />
                <span className={styles.ruleText}>{r.text}</span>
              </li>
            ))}
          </ul>
        </div>
        <BoostAuctionPreview />
      </div>
    </section>
  );
}
