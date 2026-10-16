import type { Metadata } from "next";
import { BusinessCta } from "@/components/home/business-cta";
import { CategoryGrid } from "@/components/home/category-grid";
import { CityExplorer } from "@/components/home/city-explorer";
import { HomeHero } from "@/components/home/home-hero";
import { TrendingSection } from "@/components/home/trending-section";

const TITLE = "Tipsly – Upptäck din stad";
const DESCRIPTION =
  "Upptäck lokala företag i 25 svenska städer, jämför dina alternativ och se vad andra tipsar om. Restauranger, frisörer, gym, hantverkare och mycket mer.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/" },
};

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <CityExplorer />
      <TrendingSection />
      <CategoryGrid />
      <BusinessCta />
    </>
  );
}
