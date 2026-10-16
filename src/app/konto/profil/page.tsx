import type { Metadata } from "next";
import { ProfileEditor } from "@/components/dashboard/profile-editor";

export const metadata: Metadata = { title: "Företagsprofil" };

export default function ProfilePage() {
  return <ProfileEditor />;
}
