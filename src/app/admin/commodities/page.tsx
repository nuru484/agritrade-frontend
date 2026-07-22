import type { Metadata } from "next";
import { Suspense } from "react";
import { CommodityTable } from "@/components/admin/registry/commodity-table";
import { DataTableSkeleton } from "@/components/ui/DataTableSkeleton";

export const metadata: Metadata = { title: "Commodities" };

/** The live Commodities register - this static route wins over the
 * config-driven `[register]` template. Suspense satisfies useSearchParams
 * (the URL-synced table state) during static prerender. */
export default function CommoditiesPage() {
  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <CommodityTable />
    </Suspense>
  );
}
