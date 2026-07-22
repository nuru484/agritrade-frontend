import type { Metadata } from "next";
import { CommodityCreate } from "@/components/admin/registry/commodity-form";

export const metadata: Metadata = { title: "Add commodity" };

export default function NewCommodityPage() {
  return <CommodityCreate />;
}
