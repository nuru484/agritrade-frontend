import type { Metadata } from "next";
import { SupplierCreate } from "@/components/admin/registry/supplier-screens";

export const metadata: Metadata = { title: "Add supplier" };

export default function NewSupplierPage() {
  return <SupplierCreate />;
}
