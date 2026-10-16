import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import styles from "./status-page.module.css";

export default function NotFound() {
  return (
    <div className={styles.wrap}>
      <span className={styles.icon}>
        <Icon name="search-x" size={24} />
      </span>
      <h1 className={styles.title}>Sidan finns inte.</h1>
      <p className={styles.text}>Länken kan vara gammal, eller så har sidan flyttats.</p>
      <Link href="/" className={styles.button}>
        Till startsidan
      </Link>
    </div>
  );
}
