"use client";

import { Boost } from "@/components/boost/boost";
import { useDashboard } from "./dashboard-context";
import { TabSection } from "./dashboard-ui";

/** "Tipsly Boost" tab: the auction, fed with the state kept in the dashboard. */
export function BoostTab() {
  const { biz, boost, onBoost } = useDashboard();
  return (
    <TabSection plain>
      <Boost biz={biz} boost={boost} onBoost={onBoost} />
    </TabSection>
  );
}
