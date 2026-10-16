"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import { cx } from "@/lib/cx";
import styles from "./scroll-row.module.css";

type ScrollRowProps = {
  children: ReactNode;
  /** Classes for the outer wrapper (margins). */
  className?: string;
  /** Classes for the scrolling track (gap and item layout). */
  trackClassName?: string;
};

/**
 * A horizontally scrolling row that shows it has more content: the edges fade
 * out where items are cut off, and on devices with a mouse, arrow buttons
 * scroll by most of a screen. Keyboard users reach every item by tabbing.
 * The item marked aria-current is scrolled into view on mount.
 */
export function ScrollRow({ children, className, trackClassName }: ScrollRowProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: false, end: false });

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () => {
      const start = track.scrollLeft > 2;
      const end = track.scrollLeft + track.clientWidth < track.scrollWidth - 2;
      setEdges((e) => (e.start === start && e.end === end ? e : { start, end }));
    };
    const current = track.querySelector<HTMLElement>("[aria-current='page']");
    if (current && current.offsetLeft + current.offsetWidth > track.clientWidth) {
      track.scrollLeft = current.offsetLeft - track.clientWidth / 2 + current.offsetWidth / 2;
    }
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    track.addEventListener("scroll", measure, { passive: true });
    return () => {
      observer.disconnect();
      track.removeEventListener("scroll", measure);
    };
  }, []);

  const scroll = (dir: 1 | -1) => {
    const track = trackRef.current;
    if (track) track.scrollBy({ left: dir * track.clientWidth * 0.7, behavior: "smooth" });
  };

  return (
    <div className={cx(styles.row, edges.start && styles.fadeStart, edges.end && styles.fadeEnd, className)}>
      <div ref={trackRef} className={cx(styles.track, trackClassName)}>
        {children}
      </div>
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={() => scroll(-1)}
        className={cx(styles.arrow, styles.arrowStart, edges.start && styles.arrowVisible)}
      >
        <Icon name="chevron-right" size={16} style={{ transform: "rotate(180deg)" }} />
      </button>
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={() => scroll(1)}
        className={cx(styles.arrow, styles.arrowEnd, edges.end && styles.arrowVisible)}
      >
        <Icon name="chevron-right" size={16} />
      </button>
    </div>
  );
}
