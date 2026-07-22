import type { Metadata } from "next";
import { ExpenseCategoryEdit } from "@/components/admin/registry/expense-category-screens";

export const metadata: Metadata = { title: "Expense category" };

export default async function ExpenseCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ExpenseCategoryEdit id={id} />;
}
