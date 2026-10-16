import type * as Leaflet from "leaflet";

/**
 * Leaflet touches `window` on import, so it is loaded on demand from effects.
 * Components that render a map also need `import "leaflet/dist/leaflet.css"`.
 */
let leaflet: Promise<typeof Leaflet> | null = null;

export function loadLeaflet(): Promise<typeof Leaflet> {
  leaflet ??= import("leaflet").then((m) => ((m as { default?: typeof Leaflet }).default ?? m) as typeof Leaflet);
  return leaflet;
}

type TileSource = { url: string; options: Leaflet.TileLayerOptions };

/**
 * Base map tiles. Set NEXT_PUBLIC_MAP_TILE_URL (and NEXT_PUBLIC_MAP_ATTRIBUTION)
 * to use a commercial provider with an API key, e.g. CARTO Positron or
 * MapTiler. Without it we use Esri's keyless Light Gray Canvas, which matches
 * the design's light, quiet map style.
 */
function tileSources(): TileSource[] {
  const custom = process.env.NEXT_PUBLIC_MAP_TILE_URL;
  if (custom) {
    return [
      {
        url: custom,
        options: { maxZoom: 19, attribution: process.env.NEXT_PUBLIC_MAP_ATTRIBUTION ?? "© OpenStreetMap" },
      },
    ];
  }
  const esri = "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas";
  return [
    {
      url: `${esri}/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}`,
      options: { maxZoom: 16, maxNativeZoom: 16, attribution: "© Esri, HERE, Garmin, © OpenStreetMap" },
    },
    {
      url: `${esri}/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}`,
      options: { maxZoom: 16, maxNativeZoom: 16 },
    },
  ];
}

/** Adds the base map (and its label layer, when separate) to a map. */
export function addBaseMap(L: typeof Leaflet, map: Leaflet.Map) {
  for (const { url, options } of tileSources()) L.tileLayer(url, options).addTo(map);
}
