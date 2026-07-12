import type { Metadata } from "next";
import { PurchasesRegister } from "@/components/admin/trading/purchases-register";

export const metadata: Metadata = {
  title: "Purchases",
  description: "Goods bought from suppliers and farmers.",
};

export default function PurchasesPage() {
  return <PurchasesRegister />;
}
