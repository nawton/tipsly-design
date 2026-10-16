import { catById, cityById, subById } from "@/lib/data";
import { routes } from "@/lib/routes";
import type { Category, City, Subcategory } from "@/lib/types";

/** The listing a /utforska/[city]/[[...slug]] URL points at. */
export type DiscoverRoute = { city: City; cat: Category | null; sub: Subcategory | null };

const own = <T,>(map: Record<string, T>, id: string | undefined): T | null =>
  id && Object.hasOwn(map, id) ? map[id] : null;

/**
 * Resolves the route params. Returns null for an unknown city, an unknown
 * category, a subcategory that belongs to another category, or a slug with
 * more than two parts.
 */
export function resolveDiscover(cityId: string | undefined, slug: string[] | undefined = []): DiscoverRoute | null {
  const city = own(cityById, cityId);
  if (!city || slug.length > 2) return null;
  const cat = slug[0] ? own(catById, slug[0]) : null;
  if (slug[0] && !cat) return null;
  const sub = slug[1] ? own(subById, slug[1]) : null;
  if (slug[1] && (!sub || sub.cat !== cat?.id)) return null;
  return { city, cat, sub };
}

/** Page heading, e.g. "Frisörer i Malmö", "”kaffe” i Stockholm" or "Upptäck Göteborg". */
export function discoverHeading({ city, cat, sub }: DiscoverRoute, q: string) {
  if (sub) return sub.plural + " i " + city.name;
  if (cat) return cat.name + " i " + city.name;
  if (q) return "”" + q + "” i " + city.name;
  return "Upptäck " + city.name;
}

/** Intro text under the heading, also used as the meta description. */
export function discoverBlurb({ city, cat }: DiscoverRoute) {
  if (cat) {
    return cat.blurb + " i " + city.name + ", från " + city.hoods[0] + " till " + city.hoods[city.hoods.length - 1] + ".";
  }
  return "Lokala företag i " + city.name + " inom åtta kategorier. Du väljer själv hur resultaten sorteras.";
}

/** Query keys for the listing's view settings. */
export const QUERY_KEYS = {
  q: "q",
  sort: "sortera",
  open: "oppet",
  top: "betyg",
  view: "vy",
} as const;

/** Builds a listing URL and appends the view settings in `keep` (a query string without "?"). */
export function discoverHref(target: { city: string; cat?: string | null; sub?: string | null }, keep = "") {
  const path = routes.discover(target);
  return keep ? path + "?" + keep : path;
}
