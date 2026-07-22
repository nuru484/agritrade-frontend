import type { Metadata } from "next";
import { WarehouseCreate } from "@/components/admin/registry/warehouse-screens";

export const metadata: Metadata = { title: "Add warehouse" };

export default function NewWarehousePage() {
  return <WarehouseCreate />;
}
