import type { Metadata } from "next";
import { Settings } from "@/components/dashboard/settings";

export const metadata: Metadata = { title: "Inställningar" };

export default function SettingsPage() {
  return <Settings />;
}
