import Link from "next/link";
import type { CSSProperties } from "react";
import { Icon } from "@/components/ui/icon";
import type { Business } from "@/lib/types";
import { OpenStatus } from "./open-status";
import { ProfileActions } from "./profile-actions";
import { RatingButton } from "./rating-button";
import styles from "./profile-header.module.css";

type ProfileHeaderProps = {
  biz: Business;
  /** The subcategory listing in the business's city. */
  subHref: string;
  /** Element id of the reviews section, for the rating link. */
  reviewsId: string;
};

/** Avatar, name, rating, open status and actions, plus the sponsored-placement notice. */
export function ProfileHeader({ biz, subHref, reviewsId }: ProfileHeaderProps) {
  return (
    <>
      <div className={styles.header}>
        <div className={styles.identity}>
          <span aria-hidden="true" className={styles.avatar} style={{ "--tone-ink": biz.toneInk } as CSSProperties}>
            {biz.initials}
          </span>
          <div className={styles.titles}>
            <div className={styles.meta}>
              <Link href={subHref} className={styles.metaLink}>
                {biz.subName}
              </Link>
              <span>·</span>
              <span>{biz.place}</span>
              {biz.sponsored && <span className={styles.chip}>Sponsrad</span>}
            </div>
            <h1 className={styles.name}>{biz.name}</h1>
            <div className={styles.facts}>
              {biz.hasRating ? (
                <RatingButton biz={biz} targetId={reviewsId} />
              ) : (
                <span className={styles.noRating}>Inga omdömen än</span>
              )}
              <OpenStatus biz={biz} />
            </div>
          </div>
        </div>
        <ProfileActions biz={biz} />
      </div>

      {biz.sponsored && (
        <div className={styles.notice}>
          <Icon name="info" size={17} className={styles.noticeIcon} />
          <span>
            <span className={styles.noticeTitle}>Sponsrad placering.</span> {biz.name} har just nu en tillfällig
            topplacering i {biz.catName}, {biz.cityName}, köpt via Tipsly Boost. Det påverkar inte betyg, omdömen eller
            hur andra resultat sorteras.
          </span>
        </div>
      )}
    </>
  );
}
