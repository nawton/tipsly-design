import { notFound } from "next/navigation";
import { resolveDiscover } from "@/components/discover/discover-route";

/**
 * Validates the route outside the loading.tsx boundary, so an unknown city or
 * category is rejected before streaming starts and answers with a real 404.
 */
export default async function DiscoverLayout({ params, children }: LayoutProps<"/utforska/[city]/[[...slug]]">) {
  const { city, slug } = await params;
  if (!resolveDiscover(city, slug)) notFound();
  return children;
}
