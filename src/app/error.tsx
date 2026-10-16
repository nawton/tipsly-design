"use client";

import { useEffect } from "react";
import { Icon } from "@/components/ui/icon";
import styles from "./status-page.module.css";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div role="alert" className={styles.wrap}>
      <span className={styles.iconDanger}>
        <Icon name="wifi-off" size={24} />
      </span>
      <h1 className={styles.title}>Något gick fel.</h1>
      <p className={styles.text}>Kontrollera din anslutning och försök igen.</p>
      <button type="button" onClick={reset} className={styles.button}>
        <Icon name="refresh-cw" size={16} />
        Försök igen
      </button>
    </div>
  );
}
