import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PurchaseDetail } from "@/components/admin/trading/purchase-detail";
import { getPurchaseDetail } from "@/static-data/admin/trading";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return { title: `Purchase ${decodeURIComponent(id)}` };
}

export default async function PurchaseDetailPage({ params }: PageProps) {
  const { id } = await params;
  const detail = getPurchaseDetail(decodeURIComponent(id));
  if (!detail) notFound();
  return <PurchaseDetail key={detail.row.ref} detail={detail} />;
}
