"use client";

import { useParams } from "next/navigation";
import { resolveDiscover } from "@/components/discover/discover-route";
import { ResultsSkeleton } from "@/components/discover/discover-states";
import { DiscoverFrame, DiscoverView } from "@/components/discover/discover-view";

/** Keeps the heading and toolbar of the listing being opened and shows skeleton cards for the results. */
export default function DiscoverLoading() {
  const { city, slug } = useParams<{ city: string; slug?: string[] }>();
  const route = resolveDiscover(city, slug);
  if (!route) {
    return (
      <DiscoverFrame>
        <ResultsSkeleton />
      </DiscoverFrame>
    );
  }
  return <DiscoverView city={route.city.id} cat={route.cat?.id} sub={route.sub?.id} status="loading" />;
}
