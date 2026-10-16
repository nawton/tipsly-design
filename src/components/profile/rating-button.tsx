"use client";

import type { Business } from "@/lib/types";
import { Stars } from "./stars";
import styles from "./rating-button.module.css";

/** The rating under the business name. Scrolls down to the reviews section. */
export function RatingButton({ biz, targetId }: { biz: Business; targetId: string }) {
  const toReviews = () => {
    const el = document.getElementById(targetId);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 84, behavior: "smooth" });
  };

  return (
    <button type="button" onClick={toReviews} className={styles.button}>
      <Stars rating={biz.rating} size={15} />
      <span className={styles.value}>{biz.ratingText}</span>
      <span className={styles.count}>· {biz.reviewsText}</span>
    </button>
  );
}
