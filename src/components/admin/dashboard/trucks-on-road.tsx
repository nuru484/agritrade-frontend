import Link from "next/link";
import { AdminCard, Mono, ToneBadge } from "@/components/admin/ui";
import { TRUCKS_ON_ROAD } from "@/static-data/admin/dashboard";
import { ADMIN_HOME } from "@/static-data/admin/nav";

/** Trucks on the road — active shipments, each linking into Shipments. */
export function TrucksOnRoad() {
  return (
    <AdminCard className="overflow-hidden">
      <div className="border-b border-slate-100 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-700">
        Trucks on the road
      </div>
      {TRUCKS_ON_ROAD.map((t) => (
        <Link
          key={t.ref}
          href={`${ADMIN_HOME}/shipments`}
          className="block border-b border-slate-100 px-4 py-3 last:border-b-0 hover:bg-slate-50"
        >
          <div className="mb-1 flex items-center justify-between gap-2.5">
            <Mono className="text-[12.5px] font-semibold text-slate-800">{t.ref}</Mono>
            <ToneBadge
              tone={t.tone}
              className="px-[9px] py-[3px] text-[10px] font-bold uppercase tracking-[0.08em]"
            >
              {t.status}
            </ToneBadge>
          </div>
          <div className="text-[13.5px] font-semibold text-slate-900">{t.route}</div>
          <div className="mt-0.5 text-[12px] text-slate-500">
            {t.cargo} · {t.buyer}
          </div>
        </Link>
      ))}
    </AdminCard>
  );
}
