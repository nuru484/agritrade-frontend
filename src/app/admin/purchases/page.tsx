import type { Metadata } from "next";
import { PurchasesTable } from "@/components/admin/purchases/purchases-table";

export const metadata: Metadata = {
  title: "Purchases",
  description: "Goods bought at the farm gate and beyond.",
};

export default function PurchasesPage() {
  return <PurchasesTable />;
}
