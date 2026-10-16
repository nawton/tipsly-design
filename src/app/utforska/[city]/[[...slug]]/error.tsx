"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";
import { resolveDiscover } from "@/components/discover/discover-route";
import { DiscoverView } from "@/components/discover/discover-view";

/** Keeps the heading and toolbar and shows the listing's error panel in place of the results. */
export default function DiscoverError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  const { city, slug } = useParams<{ city: string; slug?: string[] }>();
  // Unknown routes end in not-found before rendering, so a valid route is expected here.
  const route = resolveDiscover(city, slug);
  return <DiscoverView city={route?.city.id ?? city} cat={route?.cat?.id} sub={route?.sub?.id} status="error" onRetry={retry} />;
}
