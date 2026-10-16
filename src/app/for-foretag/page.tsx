import type { Metadata } from "next";
import { BoostExplainer } from "@/components/for-business/boost-explainer";
import { BusinessFaq } from "@/components/for-business/business-faq";
import { ForBusinessHero } from "@/components/for-business/for-business-hero";
import { GettingStarted } from "@/components/for-business/getting-started";
import { PricingPlans } from "@/components/for-business/pricing-plans";
import { SignupSection } from "@/components/for-business/signup-section";

const DESCRIPTION =
  "Syns gratis på Tipsly med bilder, tjänster och öppettider. Vill du nå fler kunder kan du buda på en sponsrad topplacering i din kategori och stad med Tipsly Boost.";

export const metadata: Metadata = {
  title: "För företag",
  description: DESCRIPTION,
  alternates: { canonical: "/for-foretag" },
  openGraph: { title: "Tipsly för företag", description: DESCRIPTION, url: "/for-foretag" },
};

export default function ForBusinessPage() {
  return (
    <>
      <ForBusinessHero />
      <PricingPlans />
      <GettingStarted />
      <BoostExplainer />
      <BusinessFaq />
      <SignupSection />
    </>
  );
}
