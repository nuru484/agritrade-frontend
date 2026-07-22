import type { Metadata } from "next";
import { PurchaseDetail } from "@/components/admin/purchases/purchase-detail";

export const metadata: Metadata = {
  title: "Purchase",
  description: "One purchase's record, lifecycle and weigh-slip.",
};

export default async function PurchasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PurchaseDetail id={id} />;
}
