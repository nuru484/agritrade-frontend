import type { Metadata } from "next";
import { Suspense } from "react";
import { WarehouseTable } from "@/components/admin/registry/warehouse-screens";
import { DataTableSkeleton } from "@/components/ui/DataTableSkeleton";

export const metadata: Metadata = { title: "Warehouses" };

export default function WarehousesPage() {
  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <WarehouseTable />
    </Suspense>
  );
}
