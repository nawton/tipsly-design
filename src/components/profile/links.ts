import type { Business } from "@/lib/types";

/** OpenStreetMap route planner with the business as the destination. */
export function directionsHref(b: Business) {
  const lat = b.lat.toFixed(5), lng = b.lng.toFixed(5);
  return `https://www.openstreetmap.org/directions?route=%3B${lat}%2C${lng}#map=15/${lat}/${lng}`;
}

export function telHref(b: Business) {
  return "tel:" + b.phone.replace(/[^0-9+]/g, "");
}
