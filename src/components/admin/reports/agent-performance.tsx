import { AdminCard, Mono } from "@/components/admin/ui";
import { AGENT_PERFORMANCE } from "@/static-data/admin/reports";

/** Avg-price column drops out below sm, matching the design's narrow grid. */
const gridCols =
  "grid grid-cols-[minmax(90px,1.4fr)_44px_76px_84px] items-center gap-2.5 px-5 sm:grid-cols-[minmax(100px,1.4fr)_44px_80px_76px_92px]";

/** Agent performance — Jun 2026: buys, volume, avg price and spend. */
export function AgentPerformance() {
  return (
    <AdminCard className="overflow-hidden rounded-lg">
      <div className="border-b border-slate-100 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-700">
        Agent performance — Jun 2026
      </div>
      <div
        className={`${gridCols} h-8 border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-[0.09em] text-slate-500`}
      >
        <span>Agent</span>
        <span className="text-right">Buys</span>
        <span className="text-right">Volume</span>
        <span className="hidden text-right sm:block">Avg price</span>
        <span className="text-right">Spent</span>
      </div>
      {AGENT_PERFORMANCE.map((a) => (
        <div
          key={a.name}
          className={`${gridCols} h-[42px] border-b border-slate-100 text-[13px] last:border-b-0`}
        >
          <span className="overflow-hidden text-ellipsis whitespace-nowrap text-slate-800">
            {a.name}
          </span>
          <Mono className="text-right text-slate-600">{a.buys}</Mono>
          <Mono className="whitespace-nowrap text-right text-slate-800">{a.kg}</Mono>
          <Mono className="hidden whitespace-nowrap text-right text-slate-600 sm:block">
            {a.avg}
          </Mono>
          <Mono className="whitespace-nowrap text-right font-semibold text-slate-900">
            {a.spent}
          </Mono>
        </div>
      ))}
    </AdminCard>
  );
}
