import type { MetadataRoute } from "next";
import { allBusinesses, categories, cities } from "@/lib/data";
import { routes } from "@/lib/routes";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string) => SITE_URL + path;
  const listings = cities.flatMap((city) => [
    { url: url(routes.discover({ city: city.id })), changeFrequency: "daily" as const, priority: 0.8 },
    ...categories.flatMap((cat) => [
      { url: url(routes.discover({ city: city.id, cat: cat.id })), changeFrequency: "daily" as const, priority: 0.7 },
      ...cat.subs.map((sub) => ({
        url: url(routes.discover({ city: city.id, cat: cat.id, sub: sub.id })),
        changeFrequency: "daily" as const,
        priority: 0.6,
      })),
    ]),
  ]);
  return [
    { url: url(routes.home()), changeFrequency: "daily", priority: 1 },
    { url: url(routes.forBusiness()), changeFrequency: "monthly", priority: 0.6 },
    ...listings,
    ...allBusinesses.map((b) => ({ url: url(routes.business(b.id)), changeFrequency: "weekly" as const, priority: 0.5 })),
  ];
}
