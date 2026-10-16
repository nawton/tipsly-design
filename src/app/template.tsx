import styles from "./template.module.css";

/** Re-mounts on navigation between top-level sections, giving each page a soft entrance. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className={styles.page}>{children}</div>;
}
