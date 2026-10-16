"use client";

import "leaflet/dist/leaflet.css";
import type * as Leaflet from "leaflet";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useEffectEvent, useRef, useState, type CSSProperties } from "react";
import { Icon } from "@/components/ui/icon";
import { cx } from "@/lib/cx";
import { addBaseMap, loadLeaflet } from "@/lib/leaflet";
import type { Business, City } from "@/lib/types";
import styles from "./discover-map.module.css";

type MapViewProps = {
  items: Business[];
  city: City;
  sortLabel: string;
  /** Id of the business highlighted in both the list and the map. */
  hover: string | null;
  onHover: (id: string | null) => void;
};

/** Ranked list next to a Leaflet map; hovering either side highlights the other. */
export function MapView({ items, city, sortLabel, hover, onHover }: MapViewProps) {
  return (
    <div className={styles.layout}>
      <div className={styles.list}>
        <div className={styles.listHead}>Alla resultat · sorterade efter {sortLabel.toLowerCase()}</div>
        {items.map((b, i) => (
          <Link
            key={b.id}
            href={b.href}
            onMouseEnter={() => {
              if (hover !== b.id) onHover(b.id);
            }}
            onMouseLeave={() => onHover(null)}
            onFocus={() => {
              if (hover !== b.id) onHover(b.id);
            }}
            className={cx(styles.row, hover === b.id && styles.rowOn)}
            style={{ "--tone": b.tone, "--tone-ink": b.toneInk } as CSSProperties}
          >
            <span className={styles.rank}>{i + 1}</span>
            <span className={styles.avatar}>{b.initials}</span>
            <span className={styles.text}>
              <span className={styles.name}>{b.name}</span>
              <span className={styles.meta}>
                {b.subName} · {b.hood}
              </span>
            </span>
            <span className={styles.rating}>
              <Icon name="star" size={13} fill="currentColor" className={styles.star} />
              {b.hasRating ? b.ratingText : "Ny"}
            </span>
          </Link>
        ))}
      </div>
      <div className={styles.mapBox}>
        <ResultsMap items={items} city={city} hover={hover} onHover={onHover} />
      </div>
    </div>
  );
}

type ResultsMapProps = Pick<MapViewProps, "items" | "city" | "hover" | "onHover">;
type MapState = { L: typeof Leaflet; map: Leaflet.Map; layer: Leaflet.LayerGroup };
type Pin = { marker: Leaflet.Marker; biz: Business };

function pinIcon(L: typeof Leaflet, b: Business, on: boolean) {
  const text = b.hasRating ? b.ratingText : "Ny";
  return L.divIcon({
    className: "",
    iconSize: [0, 0],
    html: `<div class="${cx(styles.pin, on && styles.pinOn)}"><span class="${styles.pinStar}">★</span> ${text}</div>`,
  });
}

function ResultsMap({ items, city, hover, onHover }: ResultsMapProps) {
  const router = useRouter();
  const elRef = useRef<HTMLDivElement>(null);
  const pinsRef = useRef<Record<string, Pin>>({});
  const litRef = useRef<string | null>(null);
  const [state, setState] = useState<MapState | null>(null);

  const emitHover = useEffectEvent((id: string | null) => onHover(id));
  const open = useEffectEvent((href: string) => router.push(href));

  // Create the map once; Leaflet is loaded on demand.
  useEffect(() => {
    let cancelled = false;
    let map: Leaflet.Map | null = null;
    loadLeaflet().then((L) => {
      if (cancelled || !elRef.current) return;
      map = L.map(elRef.current, { zoomControl: false, scrollWheelZoom: false });
      L.control.zoom({ position: "bottomright" }).addTo(map);
      addBaseMap(L, map);
      const layer = L.layerGroup().addTo(map);
      setState({ L, map, layer });
    });
    return () => {
      cancelled = true;
      map?.remove();
    };
  }, []);

  // Rebuild the markers whenever the result set or its order changes.
  const placePins = useEffectEvent(({ L, map, layer }: MapState) => {
    layer.clearLayers();
    pinsRef.current = {};
    litRef.current = null;
    for (const b of items) {
      const marker = L.marker([b.lat, b.lng], { icon: pinIcon(L, b, false), keyboard: false, title: b.name });
      marker.on("click", () => open(b.href));
      marker.on("mouseover", () => emitHover(b.id));
      marker.on("mouseout", () => emitHover(null));
      marker.addTo(layer);
      pinsRef.current[b.id] = { marker, biz: b };
    }
    if (items.length) map.fitBounds(L.latLngBounds(items.map((b) => [b.lat, b.lng])).pad(0.12), { maxZoom: 15 });
    else map.setView([city.lat, city.lng], 13);
    const t = window.setTimeout(() => map.invalidateSize(), 80);
    return () => window.clearTimeout(t);
  });
  const ids = items.map((b) => b.id).join(",");
  useEffect(() => {
    if (state) return placePins(state);
  }, [state, ids, city.id]);

  // Highlight the hovered pin.
  useEffect(() => {
    if (!state) return;
    const prev = litRef.current;
    litRef.current = hover;
    for (const id of new Set([prev, hover])) {
      const pin = id ? pinsRef.current[id] : undefined;
      if (!pin) continue;
      pin.marker.setIcon(pinIcon(state.L, pin.biz, id === hover));
      pin.marker.setZIndexOffset(id === hover ? 1000 : 0);
    }
  }, [state, hover, ids]);

  return <div ref={elRef} className={styles.map} />;
}
