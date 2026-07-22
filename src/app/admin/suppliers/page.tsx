import type { Metadata } from "next";
import { Suspense } from "react";
import { SupplierTable } from "@/components/admin/registry/supplier-screens";
import { DataTableSkeleton } from "@/components/ui/DataTableSkeleton";

export const metadata: Metadata = { title: "Suppliers" };

/** The live Suppliers directory - replaces the config-driven stub. */
export default function SuppliersPage() {
  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <SupplierTable />
    </Suspense>
  );
}
