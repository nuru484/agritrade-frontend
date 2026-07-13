import Link from "next/link";
import { AdminCard, Mono, ToneBadge } from "@/components/admin/ui";
import { TRUCKS_ON_ROAD } from "@/static-data/admin/dashboard";
import { ADMIN_HOME } from "@/static-data/admin/nav";

/** Trucks on the road — active shipments, each linking into Shipments. */
export function TrucksOnRoad() {
  return (
    <AdminCard className="overflow-hidden">
      <div className="border-b border-soil/15 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.1em] text-soil">
        Trucks on the road
      </div>
      {TRUCKS_ON_ROAD.map((t) => (
        <Link
          key={t.ref}
          href={`${ADMIN_HOME}/shipments`}
          className="block border-b border-soil/15 px-4 py-3 last:border-b-0 hover:bg-surface-alt/70"
        >
          <div className="mb-1 flex items-center justify-between gap-2.5">
            <Mono className="text-[12.5px] font-semibold text-ink">{t.ref}</Mono>
            <ToneBadge
              tone={t.tone}
              className="px-[9px] py-[3px] text-[10px] font-bold uppercase tracking-[0.08em]"
            >
              {t.status}
            </ToneBadge>
          </div>
          <div className="text-[13.5px] font-semibold text-ink">{t.route}</div>
          <div className="mt-0.5 text-[12px] text-soil">
            {t.cargo} · {t.buyer}
          </div>
        </Link>
      ))}
    </AdminCard>
  );
}
