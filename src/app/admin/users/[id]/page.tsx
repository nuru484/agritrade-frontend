import type { Metadata } from "next";
import { UserDetail } from "@/components/admin/users/user-detail";

export const metadata: Metadata = { title: "User" };

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <UserDetail id={id} />;
}
