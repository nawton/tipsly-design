import { Icon } from "@/components/ui/icon";
import styles from "./business-faq.module.css";

const FAQ = [
  {
    q: "Kostar det något att finnas på Tipsly?",
    a: "Nej. En företagsprofil är gratis och utan tidsgräns. Du betalar bara om du väljer att buda på en topplacering via Tipsly Boost och vinner budgivningen.",
  },
  {
    q: "Vad behöver jag för att komma igång?",
    a: "Företagets namn, kategori, stad och en e-postadress. Innan profilen publiceras verifierar vi ditt organisationsnummer, så att bara riktiga företag syns på Tipsly.",
  },
  {
    q: "När syns min profil?",
    a: "Så snart organisationsnumret är verifierat publiceras profilen i din stad och kategori. Därefter kan du när som helst lägga till eller ändra bilder, tjänster, priser och öppettider i dashboarden.",
  },
  {
    q: "Kan jag betala för att hamna högre i de vanliga resultaten?",
    a: "Nej. Det enda som går att köpa är den sponsrade platsen överst, och den är alltid märkt Sponsrad. Alla andra resultat sorteras efter det besökaren väljer, och betyg och omdömen går inte att påverka.",
  },
  {
    q: "Hur fungerar budgivningen i Tipsly Boost?",
    a: "Varje kategori i varje stad har en sponsrad topplacering per vecka, från måndag till söndag. Budgivningen för nästa vecka stänger söndag kl. 20:00 och det högsta behöriga budet vinner. Minsta bud är 500 kr, och ett nytt bud måste vara minst 50 kr högre än det ledande.",
  },
  {
    q: "Vad händer om jag inte vinner?",
    a: "Då betalar du ingenting. Din profil syns som vanligt i sökningar och kategorier, och du kan buda igen nästa vecka.",
  },
  {
    q: "Måste jag binda mig?",
    a: "Nej. Det finns inga abonnemang eller bindningstider. Du budar bara de veckor du själv vill.",
  },
  {
    q: "Kan jag avsluta mitt konto?",
    a: "Ja, när som helst under Inställningar i dashboarden. Profilen tas då bort och pågående bud dras tillbaka utan att debiteras.",
  },
];

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

/** Common questions from businesses, as an accordion. Also published as FAQPage structured data. */
export function BusinessFaq() {
  return (
    <section className={styles.section} aria-labelledby="vanliga-fragor">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      <div className={styles.inner}>
        <div className={styles.head}>
          <h2 id="vanliga-fragor" className={styles.title}>
            Vanliga frågor.
          </h2>
          <p className={styles.lead}>Det viktigaste att veta innan du lägger till ditt företag.</p>
        </div>
        <div className={styles.list}>
          {FAQ.map((f) => (
            <details key={f.q} className={styles.item}>
              <summary className={styles.question}>
                {f.q}
                <span className={styles.toggle} aria-hidden="true">
                  <Icon name="plus" size={16} stroke={2} />
                </span>
              </summary>
              <p className={styles.answer}>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
