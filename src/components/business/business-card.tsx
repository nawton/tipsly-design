"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { useSaved } from "@/components/providers/app-providers";
import { Icon } from "@/components/ui/icon";
import { cx } from "@/lib/cx";
import type { Business } from "@/lib/types";
import { PhotoPlaceholder } from "./photo-placeholder";
import styles from "./business-card.module.css";

type Layout = "tile" | "row" | "compact";

type BusinessCardProps = {
  biz: Business;
  /** tile: photo on top (grids). row: wide sponsored card. compact: list row for phones. */
  layout?: Layout;
  /** Switch to the compact layout below 720px. */
  compactOnMobile?: boolean;
  /** Shown in the paid Boost position: adds the "Sponsrad" label. */
  sponsoredSlot?: boolean;
};

/** The business's first photo, the category photo, or the category placeholder. */
function Photo({
  biz,
  sizes,
  iconSize,
  initials,
}: {
  biz: Business;
  sizes: string;
  iconSize?: number;
  initials?: boolean;
}) {
  const src = biz.photos?.[0] ?? biz.cover;
  if (!src) return initials ? biz.initials : <PhotoPlaceholder icon={biz.icon} size={iconSize} />;
  return <Image src={src} alt="" fill sizes={sizes} className={styles.photoImg} />;
}

const TREND_TITLE = "Ökning i profilbesök de senaste 7 dagarna (exempeldata)";

export function BusinessCard({
  biz,
  layout = "tile",
  compactOnMobile = false,
  sponsoredSlot = false,
}: BusinessCardProps) {
  const { isSaved, toggleSave } = useSaved();
  const saved = isSaved(biz.id);
  const tone = { "--tone": biz.tone, "--tone-ink": biz.toneInk } as CSSProperties;
  const responsive = compactOnMobile && layout !== "compact";

  return (
    <div className={styles.card} style={tone}>
      {layout === "tile" && (
        <Tile biz={biz} sponsoredSlot={sponsoredSlot} className={cx(responsive && styles.desktopOnly)} />
      )}
      {layout === "row" && <Row biz={biz} className={cx(responsive && styles.desktopOnly)} />}
      {(layout === "compact" || responsive) && (
        <Compact biz={biz} sponsoredSlot={sponsoredSlot} className={cx(responsive && styles.mobileOnly)} />
      )}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleSave(biz.id);
        }}
        aria-label={saved ? `Ta bort ${biz.name} från sparade` : `Spara ${biz.name}`}
        aria-pressed={saved}
        className={cx(
          styles.save,
          layout === "compact" ? styles.saveCompact : styles.saveFloating,
          responsive && styles.saveCompactOnMobile,
          saved && styles.saveActive,
        )}
      >
        <Icon name="bookmark" size={16} fill={saved ? "currentColor" : "none"} />
      </button>
    </div>
  );
}

function Rating({ biz, long }: { biz: Business; long?: boolean }) {
  if (!biz.hasRating) {
    return <span className={styles.faint}>Ny på Tipsly · inga omdömen än</span>;
  }
  return (
    <>
      <Icon name="star" size={14} fill="currentColor" className={styles.star} />
      <span className={styles.ratingValue}>{biz.ratingText}</span>
      <span className={styles.faint}>{long ? "· " + biz.reviewsText : biz.reviewsShort}</span>
    </>
  );
}

function Tile({ biz, sponsoredSlot, className }: { biz: Business; sponsoredSlot: boolean; className?: string }) {
  return (
    <Link href={biz.href} className={cx(styles.tile, className)}>
      <div className={cx(styles.photo, styles.tilePhoto)}>
        <Photo biz={biz} sizes="(min-width: 1200px) 290px, (min-width: 720px) 34vw, 100vw" />
        <div className={styles.badges}>
          {sponsoredSlot && (
            <span title="Köpt topplacering via Tipsly Boost" className={styles.glassBadge}>
              Sponsrad
            </span>
          )}
          {biz.hasTrend && (
            <span title={TREND_TITLE} className={cx(styles.glassBadge, styles.trendBadge)}>
              <Icon name="trending-up" size={13} stroke={2} />
              {biz.trendText}
            </span>
          )}
        </div>
      </div>
      <div className={styles.tileBody}>
        <span aria-hidden="true" className={styles.tileAvatar}>
          {biz.initials}
        </span>
        <div className={styles.tileMeta}>
          {biz.subName} · {biz.place}
        </div>
        <div className={styles.tileName}>{biz.name}</div>
        <div className={styles.tileRating}>
          <Rating biz={biz} />
        </div>
        <p className={styles.tileDesc}>{biz.desc}</p>
      </div>
    </Link>
  );
}

function Row({ biz, className }: { biz: Business; className?: string }) {
  return (
    <Link href={biz.href} className={cx(styles.row, className)}>
      <div className={cx(styles.photo, styles.rowPhoto)}>
        <Photo biz={biz} sizes="300px" iconSize={52} />
      </div>
      <div className={styles.rowBody}>
        <div className={styles.rowTop}>
          <span aria-hidden="true" className={styles.rowAvatar}>
            {biz.initials}
          </span>
          <span className={styles.chip}>Sponsrad</span>
        </div>
        <div className={styles.rowMeta}>
          {biz.subName} · {biz.place}
        </div>
        <div className={styles.rowName}>{biz.name}</div>
        <div className={styles.rowRating}>
          <Rating biz={biz} long />
        </div>
        <p className={styles.rowDesc}>{biz.desc}</p>
        <span className={styles.rowMore}>
          Visa profil
          <Icon name="arrow-right" size={15} />
        </span>
      </div>
    </Link>
  );
}

function Compact({ biz, sponsoredSlot, className }: { biz: Business; sponsoredSlot: boolean; className?: string }) {
  return (
    <Link href={biz.href} className={cx(styles.compact, className)}>
      <div aria-hidden="true" className={styles.compactThumb}>
        <Photo biz={biz} sizes="92px" initials />
      </div>
      <div className={styles.compactBody}>
        {sponsoredSlot && <span className={styles.compactChip}>Sponsrad</span>}
        <div className={styles.compactMeta}>
          {biz.subName} · {biz.hood}
        </div>
        <div className={styles.compactName}>{biz.name}</div>
        <div className={styles.compactStats}>
          {biz.hasRating ? (
            <span className={styles.compactRating}>
              <Icon name="star" size={13} fill="currentColor" className={styles.star} />
              <span className={styles.ratingValue}>{biz.ratingText}</span>
              <span className={styles.faint}>{biz.reviewsShort}</span>
            </span>
          ) : (
            <span className={styles.faint}>Ny på Tipsly</span>
          )}
          {biz.hasTrend && (
            <span title={TREND_TITLE} className={styles.compactTrend}>
              <Icon name="trending-up" size={13} stroke={2} />
              {biz.trendText}
            </span>
          )}
        </div>
        <p className={styles.compactDesc}>{biz.desc}</p>
      </div>
    </Link>
  );
}
