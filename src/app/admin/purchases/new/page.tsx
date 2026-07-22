import type { Metadata } from "next";
import { PurchaseCreate } from "@/components/admin/purchases/purchase-form";

export const metadata: Metadata = {
  title: "Record purchase",
  description: "Record goods bought and paid for.",
};

export default function NewPurchasePage() {
  return <PurchaseCreate />;
}
