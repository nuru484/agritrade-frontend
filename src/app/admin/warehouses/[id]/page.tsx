import type { Metadata } from "next";
import { WarehouseEdit } from "@/components/admin/registry/warehouse-screens";

export const metadata: Metadata = { title: "Warehouse" };

export default async function WarehousePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <WarehouseEdit id={id} />;
}
