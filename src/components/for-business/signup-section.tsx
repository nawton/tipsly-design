import { Icon } from "@/components/ui/icon";
import { SIGNUP_SECTION_ID } from "./anchors";
import { SignupForm } from "./signup-form";
import styles from "./signup-section.module.css";

/** The sign-up card. The header CTA links here via `routes.addBusiness()`. */
export function SignupSection() {
  return (
    <section id={SIGNUP_SECTION_ID} className={styles.section}>
      <div className={styles.card}>
        <div>
          <h2 className={styles.title}>Lägg till ditt företag.</h2>
          <p className={styles.lead}>Det tar ett par minuter. Bilder, tjänster och öppettider fyller du i efteråt.</p>
          <ul className={styles.points}>
            <li className={styles.point}>
              <Icon name="shield-check" size={18} />
              Vi verifierar ditt organisationsnummer innan profilen publiceras
            </li>
            <li className={styles.point}>
              <Icon name="credit-card" size={18} />
              Inget betalkort behövs för en gratis profil
            </li>
          </ul>
        </div>
        <div className={styles.formWrap}>
          <SignupForm />
        </div>
      </div>
    </section>
  );
}
