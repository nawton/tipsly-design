"use client";

import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/ui/icon";
import { cx } from "@/lib/cx";
import styles from "./toast.module.css";

export function Toast({ message, icon, visible }: { message: string; icon: IconName; visible: boolean }) {
  const pathname = usePathname();
  // Pages with a fixed bottom bar on phones need the toast lifted above it.
  const raised = pathname.startsWith("/foretag/") || pathname.startsWith("/utforska");
  return (
    <div role="status" aria-live="polite" className={cx(styles.toast, raised && styles.raised, visible && styles.visible)}>
      {message && (
        <>
          <Icon name={icon} size={16} />
          <span>{message}</span>
        </>
      )}
    </div>
  );
}
