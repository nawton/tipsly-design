import Image from "next/image";
import type { CSSProperties } from "react";
import { PhotoPlaceholder } from "@/components/business/photo-placeholder";
import { cx } from "@/lib/cx";
import type { Business } from "@/lib/types";
import styles from "./profile-gallery.module.css";

const HERO_SIZES = "(min-width: 1200px) 768px, (min-width: 860px) 66vw, 86vw";
const SIDE_SIZES = "(min-width: 1200px) 384px, (min-width: 860px) 33vw, 86vw";
const FULL_SIZES = "(min-width: 1200px) 1152px, 100vw";

/**
 * Photos at the top of a profile. Three or more photos get the large hero
 * plus two stacked shots; one or two get a single wide photo. Without photos
 * a shorter banner with the category icon keeps the page from opening on
 * empty space.
 */
export function ProfileGallery({ biz }: { biz: Business }) {
  const photos = biz.photos ?? [];
  const tone = { "--tone": biz.tone, "--tone-ink": biz.toneInk } as CSSProperties;

  if (photos.length === 0) {
    return (
      <div className={styles.banner} style={tone}>
        {biz.cover ? (
          <Image src={biz.cover} alt="" fill sizes={FULL_SIZES} priority className={styles.img} />
        ) : (
          <PhotoPlaceholder icon={biz.icon} size={64} />
        )}
      </div>
    );
  }

  if (photos.length < 3) {
    return (
      <div className={cx(styles.banner, styles.single)} style={tone}>
        <Image src={photos[0]} alt={biz.name} fill sizes={FULL_SIZES} priority className={styles.img} />
      </div>
    );
  }

  const slots = [
    { alt: biz.name, sizes: HERO_SIZES },
    { alt: biz.name + ", detaljbild", sizes: SIDE_SIZES },
    { alt: biz.name + ", miljöbild", sizes: SIDE_SIZES },
  ];
  return (
    <div className={styles.gallery} style={tone}>
      {slots.map((slot, i) => (
        <div key={i} className={cx(styles.item, i === 0 && styles.hero)}>
          <Image src={photos[i]} alt={slot.alt} fill sizes={slot.sizes} priority={i === 0} className={styles.img} />
        </div>
      ))}
    </div>
  );
}
