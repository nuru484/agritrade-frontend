import type { Metadata } from "next";
import { SupplierEdit } from "@/components/admin/registry/supplier-screens";

export const metadata: Metadata = { title: "Supplier" };

export default async function SupplierPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SupplierEdit id={id} />;
}
