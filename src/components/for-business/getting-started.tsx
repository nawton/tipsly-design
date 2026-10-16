import Link from "next/link";
import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/ui/icon";
import { routes } from "@/lib/routes";
import { BoostStepVisual, ListingStepVisual, SignupStepVisual } from "./getting-started-visuals";
import { ScrollToFormButton } from "./scroll-to-form-button";
import styles from "./getting-started.module.css";

type Step = {
  n: string;
  title: string;
  text: string;
  points: string[];
  meta: { icon: IconName; label: string }[];
  visual: ReactNode;
};

const STEPS: Step[] = [
  {
    n: "01",
    title: "Skapa din profil på ett par minuter.",
    text: "Allt som behövs för att komma igång är företagets namn, kategori, stad och en e-postadress. Profilen är gratis och du behöver inget betalkort.",
    points: [
      "Vi verifierar ditt organisationsnummer innan profilen publiceras, så att bara riktiga företag syns.",
      "Bilder, tjänster, priser och öppettider fyller du i när det passar dig.",
      "Allt går att ändra i efterhand i din dashboard.",
    ],
    meta: [
      { icon: "clock", label: "Ett par minuter" },
      { icon: "tag", label: "Gratis" },
    ],
    visual: <SignupStepVisual />,
  },
  {
    n: "02",
    title: "Syns gratis för kunder i din stad.",
    text: "När profilen är publicerad dyker den upp när någon söker, bläddrar i din kategori eller tittar på kartan.",
    points: [
      "Alla sorteras efter samma regler: besök, betyg och omdömen. Ingen kan köpa sig högre i de vanliga resultaten.",
      "Kunder kan spara ditt företag, ringa, få vägbeskrivning eller gå till din webbplats direkt från profilen.",
      "I dashboarden ser du hur många som besöker profilen, sparar den och klickar vidare.",
    ],
    meta: [{ icon: "tag", label: "Gratis, utan tidsgräns" }],
    visual: <ListingStepVisual />,
  },
  {
    n: "03",
    title: "Boosta när du vill nå fler.",
    text: "Varje vecka finns en sponsrad topplacering överst i varje kategori och stad. Den går till det högsta budet, och du väljer själv om och när du vill vara med.",
    points: [
      "Lägg ditt bud senast söndag kl. 20:00. Placeringen gäller måndag till söndag veckan efter.",
      "Du betalar bara om du vinner. Minsta bud är 500 kr exklusive moms.",
      "Placeringen märks alltid Sponsrad och påverkar inte betyg eller den vanliga rankningen.",
    ],
    meta: [{ icon: "zap", label: "Valfritt, från 500 kr per vecka" }],
    visual: <BoostStepVisual />,
  },
];

/** The three steps from sign-up to a sponsored placement, each with a small illustration. */
export function GettingStarted() {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <header className={styles.head}>
          <h2 className={styles.title}>Så kommer du igång.</h2>
          <p className={styles.lead}>
            Från registrering till dina första besök. Så här fungerar Tipsly för dig som företagare, steg för steg.
          </p>
        </header>

        <ol className={styles.steps}>
          {STEPS.map((s) => (
            <li key={s.n} className={styles.step}>
              <div className={styles.copy}>
                <span className={styles.n}>{s.n}</span>
                <h3 className={styles.stepTitle}>{s.title}</h3>
                <p className={styles.stepText}>{s.text}</p>
                <ul className={styles.points}>
                  {s.points.map((p) => (
                    <li key={p} className={styles.point}>
                      <Icon name="check" size={16} stroke={2.25} className={styles.check} />
                      {p}
                    </li>
                  ))}
                </ul>
                <div className={styles.meta}>
                  {s.meta.map((m) => (
                    <span key={m.label} className={styles.metaChip}>
                      <Icon name={m.icon} size={14} />
                      {m.label}
                    </span>
                  ))}
                </div>
              </div>
              <div className={styles.visual} aria-hidden="true">
                {s.visual}
              </div>
            </li>
          ))}
        </ol>

        <div className={styles.actions}>
          <ScrollToFormButton className={styles.primary}>Skapa gratis profil</ScrollToFormButton>
          <Link href={routes.dashboard()} className={styles.secondary}>
            Se hur dashboarden ser ut
            <Icon name="arrow-right" size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
