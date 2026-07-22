import type { Metadata } from "next";
import { ExpenseCategoryCreate } from "@/components/admin/registry/expense-category-screens";

export const metadata: Metadata = { title: "Add expense category" };

export default function NewExpenseCategoryPage() {
  return <ExpenseCategoryCreate />;
}
