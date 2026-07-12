import Link from "next/link";
import { AdminButton, Mono } from "@/components/admin/ui";
import { shipmentRows } from "@/static-data/admin/trading";
import { StatusChip } from "./bits";

export function ShipmentsRegister() {
  return (
    <div>
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold tracking-[-0.01em] text-slate-900">Shipments</h1>
          <div className="mt-0.5 text-[13px] text-slate-500">
            Trucks moving goods between warehouses and buyers
          </div>
        </div>
        <AdminButton className="h-[34px] whitespace-nowrap">+ Plan shipment</AdminButton>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {shipmentRows.map((sh) => (
          <Link
            key={sh.ref}
            href={`/admin/shipments/${sh.ref}`}
            className="rounded-[8px] border border-slate-200 bg-white px-4 py-[15px] hover:border-slate-300"
          >
            <div className="mb-[7px] flex items-center justify-between gap-2.5">
              <Mono className="text-[13px] font-semibold text-console">{sh.ref}</Mono>
              <StatusChip tone={sh.tone}>{sh.status}</StatusChip>
            </div>
            <div className="text-[14.5px] font-semibold text-slate-900">{sh.route}</div>
            <div className="mt-[3px] text-[12.5px] text-slate-500">{sh.cargo}</div>
            <div className="mt-0.5 text-[12px] text-slate-400">{sh.meta}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
