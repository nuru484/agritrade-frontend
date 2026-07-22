import type { Metadata } from "next";
import { BuyerCreate } from "@/components/admin/registry/buyer-screens";

export const metadata: Metadata = { title: "Add buyer" };

export default function NewBuyerPage() {
  return <BuyerCreate />;
}
