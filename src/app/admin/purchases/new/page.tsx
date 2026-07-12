import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PurchaseForm } from "@/components/admin/trading/purchase-form";
import { purchaseRows } from "@/static-data/admin/trading";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const sp = await searchParams;
  const editRef = typeof sp.edit === "string" ? sp.edit : undefined;
  return { title: editRef ? `Edit purchase ${editRef}` : "Record purchase" };
}

/** New purchase; `?edit=<ref>` edits and `?from=<ref>` duplicates a purchase. */
export default async function PurchaseFormPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const editRef = typeof sp.edit === "string" ? sp.edit : undefined;
  const fromRef = typeof sp.from === "string" ? sp.from : undefined;

  const sourceRef = editRef ?? fromRef;
  const prefill = sourceRef ? purchaseRows.find((r) => r.ref === sourceRef) : undefined;
  if (sourceRef && !prefill) notFound();

  return <PurchaseForm key={sourceRef ?? "new"} editRef={editRef} prefill={prefill} />;
}
