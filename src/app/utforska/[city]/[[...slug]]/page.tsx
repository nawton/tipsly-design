import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { discoverBlurb, discoverHeading, resolveDiscover } from "@/components/discover/discover-route";
import { DiscoverView } from "@/components/discover/discover-view";
import { routes } from "@/lib/routes";

type Props = PageProps<"/utforska/[city]/[[...slug]]">;

/** layout.tsx already rejects unknown routes; this narrows the type. */
async function resolve(props: Props) {
  const { city, slug } = await props.params;
  return resolveDiscover(city, slug) ?? notFound();
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const route = await resolve(props);
  const { q } = await props.searchParams;
  const query = (typeof q === "string" ? q : "").trim();
  const title = discoverHeading(route, query);
  const description = discoverBlurb(route);
  const canonical = routes.discover({ city: route.city.id, cat: route.cat?.id, sub: route.sub?.id, q: query });
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical },
  };
}

export default async function DiscoverPage(props: Props) {
  const { city, cat, sub } = await resolve(props);
  return <DiscoverView city={city.id} cat={cat?.id} sub={sub?.id} />;
}
