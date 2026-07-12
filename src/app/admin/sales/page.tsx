import type { Metadata } from "next";
import { SalesRegister } from "@/components/admin/trading/sales-register";

export const metadata: Metadata = {
  title: "Sales",
  description: "Agreements with buyers, payments and fulfilment.",
};

export default function SalesPage() {
  return <SalesRegister />;
}
