import type { Metadata } from "next";
import { ShipmentsRegister } from "@/components/admin/trading/shipments-register";

export const metadata: Metadata = {
  title: "Shipments",
  description: "Trucks moving goods between warehouses and buyers.",
};

export default function ShipmentsPage() {
  return <ShipmentsRegister />;
}
