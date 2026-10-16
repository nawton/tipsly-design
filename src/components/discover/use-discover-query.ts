"use client";

import { useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { isSort } from "@/lib/data";
import type { SortId } from "@/lib/types";
import { QUERY_KEYS } from "./discover-route";

type QueryKey = (typeof QUERY_KEYS)[keyof typeof QUERY_KEYS];
export type QueryPatch = Partial<Record<QueryKey, string | null>>;

export type DiscoverQuery = {
  /** The applied search text. */
  q: string;
  sort: SortId;
  /** True when the visitor picked a sort order (the prototype's `sortTouched`). */
  sortExplicit: boolean;
  openNow: boolean;
  topRated: boolean;
  isMap: boolean;
  /** View settings kept by category links and breadcrumbs (everything except q), without "?". */
  keep: string;
};

/**
 * The listing's view settings live in the query string so a listing can be
 * shared as it looks: ?q=&sortera=&oppet=1&betyg=1&vy=karta.
 */
export function useDiscoverQuery(): [DiscoverQuery, (patch: QueryPatch) => void] {
  const params = useSearchParams();

  const q = (params.get(QUERY_KEYS.q) ?? "").trim();
  const sortParam = params.get(QUERY_KEYS.sort);
  const sortExplicit = isSort(sortParam);
  const sort: SortId = isSort(sortParam) ? sortParam : q ? "relevance" : "popular";
  const openNow = params.get(QUERY_KEYS.open) === "1";
  const topRated = params.get(QUERY_KEYS.top) === "1";
  const isMap = params.get(QUERY_KEYS.view) === "karta";

  const keepParams = new URLSearchParams();
  if (sortExplicit) keepParams.set(QUERY_KEYS.sort, sort);
  if (openNow) keepParams.set(QUERY_KEYS.open, "1");
  if (topRated) keepParams.set(QUERY_KEYS.top, "1");
  if (isMap) keepParams.set(QUERY_KEYS.view, "karta");

  // Reads the live URL, so debounced callers never apply a stale query.
  // Next.js syncs useSearchParams with replaceState without a server round trip.
  const update = useCallback((patch: QueryPatch) => {
    const next = new URLSearchParams(window.location.search);
    for (const [key, value] of Object.entries(patch)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    const qs = next.toString();
    window.history.replaceState(null, "", window.location.pathname + (qs ? "?" + qs : "") + window.location.hash);
  }, []);

  return [{ q, sort, sortExplicit, openNow, topRated, isMap, keep: keepParams.toString() }, update];
}
