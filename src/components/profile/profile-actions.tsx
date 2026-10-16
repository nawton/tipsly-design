"use client";

import { useSaved, useToast } from "@/components/providers/app-providers";
import { Icon } from "@/components/ui/icon";
import { cx } from "@/lib/cx";
import type { Business } from "@/lib/types";
import { directionsHref } from "./links";
import styles from "./profile-actions.module.css";

/** Spara, Dela and Vägbeskrivning next to the business name. */
export function ProfileActions({ biz }: { biz: Business }) {
  const { isSaved, toggleSave } = useSaved();
  const toast = useToast();
  const saved = isSaved(biz.id);

  const share = () => {
    const done = () => toast("Länken är kopierad", "link");
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(window.location.href).then(done, done);
    else done();
  };

  return (
    <div className={styles.actions}>
      <button
        type="button"
        onClick={() => toggleSave(biz.id)}
        aria-pressed={saved}
        className={cx(styles.button, saved && styles.saved)}
      >
        <Icon name="bookmark" size={17} fill={saved ? "currentColor" : "none"} />
        {saved ? "Sparad" : "Spara"}
      </button>
      <button type="button" onClick={share} className={styles.button}>
        <Icon name="share" size={17} />
        Dela
      </button>
      <a href={directionsHref(biz)} target="_blank" rel="noopener" className={styles.directions}>
        <Icon name="navigation" size={16} />
        Vägbeskrivning
      </a>
    </div>
  );
}
