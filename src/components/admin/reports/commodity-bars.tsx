import { AdminCard, Mono } from "@/components/admin/ui";
import { COMMODITY_PROFIT_BARS } from "@/static-data/admin/reports";

/** Gross profit by commodity — horizontal bars scaled to the top earner. */
export function CommodityBars() {
  return (
    <AdminCard className="min-w-0 rounded-lg px-[18px] py-3.5">
      <div className="mb-3.5 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-700">
        Gross profit by commodity — Jun
      </div>
      <div className="flex flex-col gap-3">
        {COMMODITY_PROFIT_BARS.map((b) => (
          <div key={b.name}>
            <div className="mb-1 flex justify-between gap-2.5 text-[12.5px]">
              <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-slate-700">
                {b.name}
              </span>
              <Mono className="flex-none whitespace-nowrap font-semibold text-slate-900">
                {b.value}
              </Mono>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full"
                style={{ width: `${b.pct}%`, background: b.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </AdminCard>
  );
}
