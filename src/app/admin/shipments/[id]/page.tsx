import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShipmentDetail } from "@/components/admin/trading/shipment-detail";
import { getShipmentDetail } from "@/static-data/admin/trading";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return { title: `Shipment ${decodeURIComponent(id)}` };
}

export default async function ShipmentDetailPage({ params }: PageProps) {
  const { id } = await params;
  const detail = getShipmentDetail(decodeURIComponent(id));
  if (!detail) notFound();
  return <ShipmentDetail key={detail.row.ref} detail={detail} />;
}
