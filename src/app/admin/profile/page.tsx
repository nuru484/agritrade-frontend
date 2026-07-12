import type { Metadata } from "next";
import { ProfileScreen } from "@/components/admin/profile-screen";

export const metadata: Metadata = { title: "My profile" };

export default function ProfilePage() {
  return <ProfileScreen />;
}
