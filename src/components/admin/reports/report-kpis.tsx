import { cn } from "@/lib/utils";
import { AdminCard, Mono } from "@/components/admin/ui";
import { REPORT_KPIS } from "@/static-data/admin/reports";

/** The six P&L headline cards: value + comparison delta vs May. */
export function ReportKpis() {
  return (
    <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      {REPORT_KPIS.map((k) => (
        <AdminCard key={k.label} className="px-[15px] py-[13px]">
          <div className="mb-[7px] text-[10.5px] font-semibold uppercase tracking-[0.1em] text-soil">
            {k.label}
          </div>
          <Mono
            className={cn(
              "block whitespace-nowrap text-[19px] font-bold tracking-[-0.02em]",
              k.profit ? "text-[#2F5E3D]" : "text-ink",
            )}
          >
            {k.value}
          </Mono>
          <div
            className={cn(
              "mt-[3px] text-[11.5px] tabular-nums",
              k.deltaUp ? "text-[#2F5E3D]" : "text-soil",
            )}
          >
            {k.delta}
          </div>
        </AdminCard>
      ))}
    </div>
  );
}
