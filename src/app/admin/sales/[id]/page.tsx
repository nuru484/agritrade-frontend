import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SaleDetail } from "@/components/admin/trading/sale-detail";
import { getSaleDetail } from "@/static-data/admin/trading";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return { title: `Sale ${decodeURIComponent(id)}` };
}

export default async function SaleDetailPage({ params, searchParams }: PageProps) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const detail = getSaleDetail(decodeURIComponent(id));
  if (!detail) notFound();
  return <SaleDetail key={detail.row.ref} detail={detail} initialPayOpen={sp.pay === "1"} />;
}
