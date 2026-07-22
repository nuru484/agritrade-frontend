import type { Metadata } from "next";
import { CommodityEdit } from "@/components/admin/registry/commodity-form";

export const metadata: Metadata = { title: "Commodity" };

export default async function CommodityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CommodityEdit id={id} />;
}
