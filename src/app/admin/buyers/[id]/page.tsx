import type { Metadata } from "next";
import { BuyerEdit } from "@/components/admin/registry/buyer-screens";

export const metadata: Metadata = { title: "Buyer" };

export default async function BuyerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BuyerEdit id={id} />;
}
