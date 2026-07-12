import type { Metadata } from "next";
import { Suspense } from "react";
import { UsersTable } from "@/components/admin/users/users-table";
import { DataTableSkeleton } from "@/components/ui/DataTableSkeleton";

export const metadata: Metadata = { title: "Users" };

/** The live Users register — this static route wins over the config-driven
 * `[register]` template, which is why the stub `users` entry was retired.
 * Suspense satisfies useSearchParams (the URL-synced table state) during
 * static prerender. */
export default function UsersPage() {
  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <UsersTable />
    </Suspense>
  );
}
