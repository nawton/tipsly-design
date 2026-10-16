"use client";

import { useToast } from "@/components/providers/app-providers";
import { Icon } from "@/components/ui/icon";
import type { Business } from "@/lib/types";
import { directionsHref, telHref } from "./links";
import styles from "./profile-contact.module.css";

/** Address, phone, website and Instagram. The web links are fictional, so they only explain that. */
export function ProfileContact({ biz }: { biz: Business }) {
  const toast = useToast();
  const demoLink = () => toast("Demo: länken går inte till en riktig sida", "info");

  return (
    <div className={styles.card}>
      <a href={directionsHref(biz)} target="_blank" rel="noopener" className={styles.row}>
        <Icon name="map-pin" size={18} className={styles.icon} />
        <span className={styles.address}>{biz.address}</span>
        <Icon name="arrow-up-right" size={15} className={styles.external} />
      </a>
      <a href={telHref(biz)} className={styles.row}>
        <Icon name="phone" size={18} className={styles.icon} />
        <span className={styles.phone}>{biz.phone}</span>
      </a>
      <button type="button" onClick={demoLink} className={styles.row}>
        <Icon name="globe" size={18} className={styles.icon} />
        <span className={styles.text}>{biz.web}</span>
        <Icon name="arrow-up-right" size={15} className={styles.external} />
      </button>
      <button type="button" onClick={demoLink} className={styles.row}>
        <Icon name="instagram" size={18} className={styles.icon} />
        <span className={styles.text}>{biz.insta}</span>
        <Icon name="arrow-up-right" size={15} className={styles.external} />
      </button>
    </div>
  );
}
