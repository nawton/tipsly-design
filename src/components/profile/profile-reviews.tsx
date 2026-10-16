"use client";

import type { CSSProperties } from "react";
import { useToast } from "@/components/providers/app-providers";
import { Icon } from "@/components/ui/icon";
import { useNow } from "@/hooks/use-now";
import { ratingDist, reviewsFor } from "@/lib/data";
import type { Business } from "@/lib/types";
import { Stars } from "./stars";
import styles from "./profile-reviews.module.css";

/** Rating summary with distribution bars, the latest reviews, or the empty state. */
export function ProfileReviews({ biz, id }: { biz: Business; id: string }) {
  const toast = useToast();
  const now = useNow();

  return (
    <section id={id} aria-labelledby={id + "-rubrik"}>
      <div className={styles.head}>
        <h2 id={id + "-rubrik"} className={styles.title}>
          Omdömen
        </h2>
        <button
          type="button"
          onClick={() => toast("Omdömen kopplas in när inloggning finns", "info")}
          className={styles.write}
        >
          <Icon name="pencil" size={15} />
          Skriv ett omdöme
        </button>
      </div>

      {biz.hasRating ? (
        <>
          <div className={styles.summary}>
            <div className={styles.score}>
              <div className={styles.scoreValue}>{biz.ratingText}</div>
              <Stars rating={biz.rating} size={16} wide />
              <div className={styles.scoreCount}>{biz.reviewsText}</div>
            </div>
            <div className={styles.dist}>
              {ratingDist(biz).map((d) => (
                <div key={d.stars} className={styles.distRow}>
                  <span className={styles.distLabel}>{d.stars}</span>
                  <span className={styles.track}>
                    <span className={styles.bar} style={{ "--pct": d.pct + "%" } as CSSProperties} />
                  </span>
                  <span className={styles.distPct}>{d.pct} %</span>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.list}>
            {reviewsFor(biz, now).map((r) => (
              <article key={r.id} className={styles.review}>
                <div className={styles.reviewHead}>
                  <span aria-hidden="true" className={styles.initial}>
                    {r.initial}
                  </span>
                  <div className={styles.who}>
                    <div className={styles.reviewer}>{r.name}</div>
                    <div className={styles.date}>{r.date}</div>
                  </div>
                  <Stars rating={r.rating} size={13} label={`${r.rating} av 5 stjärnor`} />
                </div>
                <p className={styles.text}>{r.text}</p>
              </article>
            ))}
          </div>
          <p className={styles.note}>Omdömena är påhittade exempel för den här förhandsversionen.</p>
        </>
      ) : (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>
            <Icon name="message-square" size={22} />
          </span>
          <div className={styles.emptyTitle}>Inga omdömen än</div>
          <p className={styles.emptyText}>Har du besökt {biz.name}? Bli först med att tipsa andra.</p>
        </div>
      )}
    </section>
  );
}
