"use client";

import "leaflet/dist/leaflet.css";
import type { Map as LeafletMap } from "leaflet";
import { useEffect, useRef } from "react";
import { Icon } from "@/components/ui/icon";
import { addBaseMap, loadLeaflet } from "@/lib/leaflet";
import type { Business } from "@/lib/types";
import { directionsHref } from "./links";
import styles from "./profile-map.module.css";

/** Map of the neighbourhood with the business marked, and a link to directions. */
export function ProfileMap({ biz }: { biz: Business }) {
  const ref = useRef<HTMLDivElement>(null);
  const { lat, lng } = biz;

  useEffect(() => {
    let cancelled = false;
    let map: LeafletMap | null = null;
    let sizeTimer = 0;

    loadLeaflet().then((L) => {
      const el = ref.current;
      if (cancelled || !el) return;
      map = L.map(el, { zoomControl: false, scrollWheelZoom: false }).setView([lat, lng], 15);
      addBaseMap(L, map);
      L.marker([lat, lng], {
        keyboard: false,
        icon: L.divIcon({ className: "", iconSize: [0, 0], html: `<div class="${styles.marker}"></div>` }),
      }).addTo(map);
      sizeTimer = window.setTimeout(() => map?.invalidateSize(), 120);
    });

    return () => {
      cancelled = true;
      window.clearTimeout(sizeTimer);
      map?.remove();
    };
  }, [lat, lng]);

  return (
    <div className={styles.card}>
      <div className={styles.frame}>
        <div ref={ref} className={styles.map} />
      </div>
      <a href={directionsHref(biz)} target="_blank" rel="noopener" className={styles.link}>
        Öppna vägbeskrivning
        <Icon name="arrow-up-right" size={16} />
      </a>
    </div>
  );
}
