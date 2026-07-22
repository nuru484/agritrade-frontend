import type { Metadata } from "next";
import { Suspense } from "react";
import { ExpenseCategoryTable } from "@/components/admin/registry/expense-category-screens";
import { DataTableSkeleton } from "@/components/ui/DataTableSkeleton";

export const metadata: Metadata = { title: "Expense Categories" };

export default function ExpenseCategoriesPage() {
  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <ExpenseCategoryTable />
    </Suspense>
  );
}
