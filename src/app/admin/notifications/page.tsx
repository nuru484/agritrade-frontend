import type { Metadata } from "next";
import { NotificationsScreen } from "@/components/admin/notifications-screen";

export const metadata: Metadata = { title: "Notifications" };

export default function NotificationsPage() {
  return <NotificationsScreen />;
}
