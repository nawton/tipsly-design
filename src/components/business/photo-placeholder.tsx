import { Icon, type IconName } from "@/components/ui/icon";
import { cx } from "@/lib/cx";
import styles from "./photo-placeholder.module.css";

/**
 * Stand-in for a business photo: the category tone with a soft highlight and
 * the category icon. Reads the `--tone` and `--tone-ink` custom properties
 * from an ancestor. Fills its (positioned) parent.
 */
export function PhotoPlaceholder({ icon, size = 44, className }: { icon: IconName; size?: number; className?: string }) {
  return (
    <div aria-hidden="true" className={cx(styles.placeholder, className)}>
      <Icon name={icon} size={size} stroke={1.25} className={styles.icon} />
    </div>
  );
}
