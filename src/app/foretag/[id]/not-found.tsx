import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { routes } from "@/lib/routes";
import styles from "./not-found.module.css";

/** Shown for /foretag/<id> when no business has that id. */
export default function BusinessNotFound() {
  return (
    <div className={styles.page}>
      <div className={styles.wrap}>
        <span className={styles.icon}>
          <Icon name="store" size={24} />
        </span>
        <h1 className={styles.title}>Företaget finns inte på Tipsly.</h1>
        <p className={styles.text}>Länken kan vara gammal, eller så har företaget tagits bort.</p>
        <Link href={routes.home()} className={styles.button}>
          Till startsidan
        </Link>
      </div>
    </div>
  );
}
