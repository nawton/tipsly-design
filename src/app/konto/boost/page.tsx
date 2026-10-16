import type { Metadata } from "next";
import { BoostTab } from "@/components/dashboard/boost-tab";

export const metadata: Metadata = { title: "Tipsly Boost" };

export default function BoostPage() {
  return <BoostTab />;
}
