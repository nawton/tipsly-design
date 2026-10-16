import { Icon } from "@/components/ui/icon";
import { cx } from "@/lib/cx";
import { starFills } from "@/lib/data";
import styles from "./stars.module.css";

type StarsProps = {
  rating: number | null;
  size: number;
  /** Two pixels between the stars instead of one. */
  wide?: boolean;
  /** Accessible name. Without it the stars are decorative and hidden from assistive technology. */
  label?: string;
};

/** Five outline stars, the first `round(rating)` filled. */
export function Stars({ rating, size, wide = false, label }: StarsProps) {
  const a11y = label ? { role: "img", "aria-label": label } : { "aria-hidden": true };
  return (
    <span className={cx(styles.stars, wide && styles.wide)} {...a11y}>
      {starFills(rating).map((on, i) => (
        <Icon key={i} name="star" size={size} fill={on ? "currentColor" : "none"} className={on ? styles.on : styles.off} />
      ))}
    </span>
  );
}
