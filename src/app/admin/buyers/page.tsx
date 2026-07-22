import type { Metadata } from "next";
import { Suspense } from "react";
import { BuyerTable } from "@/components/admin/registry/buyer-screens";
import { DataTableSkeleton } from "@/components/ui/DataTableSkeleton";

export const metadata: Metadata = { title: "Buyers" };

/** The live Buyers directory - replaces the config-driven stub. */
export default function BuyersPage() {
  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <BuyerTable />
    </Suspense>
  );
}
