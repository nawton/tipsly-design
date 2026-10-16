import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BusinessProfile } from "@/components/profile/business-profile";
import { byId, hm } from "@/lib/data";
import { routes } from "@/lib/routes";
import { SITE_URL } from "@/lib/site";
import type { Business } from "@/lib/types";

export async function generateMetadata({ params }: PageProps<"/foretag/[id]">): Promise<Metadata> {
  const { id } = await params;
  const b = byId[id];
  if (!b) return { title: "Företaget finns inte" };

  const title = `${b.name} – ${b.subName} i ${b.cityName}`;
  const url = routes.business(b.id);
  return {
    title,
    description: b.desc,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "sv_SE",
      siteName: "Tipsly",
      title,
      description: b.desc,
      url,
    },
  };
}

export default async function BusinessPage({ params }: PageProps<"/foretag/[id]">) {
  const { id } = await params;
  const b = byId[id];
  if (!b) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd(b)).replace(/</g, "\\u003c") }}
      />
      <BusinessProfile biz={b} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Structured data (schema.org LocalBusiness)                          */
/* ------------------------------------------------------------------ */

const SCHEMA_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const WEEK = [1, 2, 3, 4, 5, 6, 0];

function localBusinessJsonLd(b: Business) {
  // "Bergsgatan 21, 214 22 Malmö"
  const m = b.address.match(/^(.*),\s*(\d{3}\s?\d{2})\s+(.+)$/);

  // One specification per distinct opening span, listing the days that share it.
  const spans = new Map<string, { opens: string; closes: string; days: string[] }>();
  for (const day of WEEK) {
    const h = b.hours[day];
    if (!h) continue;
    const key = h.join("-");
    const span = spans.get(key) ?? { opens: hm(h[0]), closes: hm(h[1]), days: [] };
    span.days.push(SCHEMA_DAYS[day]);
    spans.set(key, span);
  }

  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": SITE_URL + routes.business(b.id),
    name: b.name,
    description: b.about,
    url: SITE_URL + routes.business(b.id),
    telephone: "+46" + b.phone.replace(/\D/g, "").replace(/^0/, ""),
    foundingDate: String(b.founded),
    address: {
      "@type": "PostalAddress",
      streetAddress: m ? m[1] : b.address,
      ...(m && { postalCode: m[2], addressLocality: m[3] }),
      addressCountry: "SE",
    },
    geo: { "@type": "GeoCoordinates", latitude: b.lat, longitude: b.lng },
    openingHoursSpecification: [...spans.values()].map((s) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: s.days,
      opens: s.opens,
      closes: s.closes,
    })),
    ...(b.rating != null &&
      b.reviews > 0 && {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: b.rating,
          reviewCount: b.reviews,
          bestRating: 5,
          worstRating: 1,
        },
      }),
  };
}
