import type { Metadata } from "next";
import { Suspense } from "react";
import { PurchaseBook } from "@/components/admin/reports/purchase-book";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Purchase book" };

/** Suspense satisfies useSearchParams (the book kept in the address) during
 * static prerender. */
export default function AdminPurchaseBookPage() {
  return (
    <Suspense fallback={<Skeleton className="h-[320px] w-full rounded-none" />}>
      <PurchaseBook />
    </Suspense>
  );
}
