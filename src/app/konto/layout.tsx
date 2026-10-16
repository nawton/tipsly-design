import type { Metadata } from "next";
import { DashboardProvider } from "@/components/dashboard/dashboard-context";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export const metadata: Metadata = {
  title: "Mitt företag",
  description: "Hantera din företagsprofil, se statistik och buda på Tipsly Boost.",
  robots: { index: false, follow: false },
};

/**
 * "Mitt företag". The provider lives in the layout so unsaved profile changes,
 * uploads and the Boost auction state survive switching between the tabs.
 */
export default function DashboardLayout({ children }: LayoutProps<"/konto">) {
  return (
    <DashboardProvider>
      <DashboardShell>{children}</DashboardShell>
    </DashboardProvider>
  );
}
