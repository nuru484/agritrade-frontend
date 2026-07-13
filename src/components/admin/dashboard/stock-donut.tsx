import { AdminCard, Mono } from "@/components/admin/ui";
import { STOCK_MIX } from "@/static-data/admin/dashboard";

/** Circumference of the r=52 donut ring (design constant). */
const C = 326.7;

/** Stock mix — donut via stroke-dasharray arcs plus a legend. */
export function StockDonut() {
  // Each slice's dash starts where the previous ones end (negative offset).
  const arcs = STOCK_MIX.slices.map((s, i) => {
    const consumed = STOCK_MIX.slices.slice(0, i).reduce((sum, prev) => sum + prev.share, 0);
    return {
      ...s,
      dasharray: `${(s.share * C).toFixed(1)} ${C}`,
      dashoffset: consumed === 0 ? "0" : `-${(consumed * C).toFixed(1)}`,
    };
  });

  return (
    <AdminCard className="min-w-0 px-[18px] py-3.5">
      <div className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-soil">
        Stock mix
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <svg
          viewBox="0 0 120 120"
          className="h-[118px] w-[118px] flex-none"
          role="img"
          aria-label={`Stock mix: ${STOCK_MIX.slices.map((s) => `${s.name} ${s.pct}`).join(", ")}`}
        >
          <circle cx="60" cy="60" r="52" fill="none" stroke="#F0F2F5" strokeWidth="14" />
          {arcs.map((a) => (
            <circle
              key={a.name}
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke={a.color}
              strokeWidth="14"
              strokeDasharray={a.dasharray}
              strokeDashoffset={a.dashoffset}
              transform="rotate(-90 60 60)"
            />
          ))}
          <text
            x="60"
            y="56"
            textAnchor="middle"
            className="font-adminmono"
            style={{ fontSize: 15, fontWeight: 700, fill: "#161c24" }}
          >
            {STOCK_MIX.center}
          </text>
          <text
            x="60"
            y="72"
            textAnchor="middle"
            style={{ fontSize: 9, fill: "#6a7686", letterSpacing: "0.08em" }}
          >
            {STOCK_MIX.centerLabel}
          </text>
        </svg>
        <div className="flex min-w-[130px] flex-1 flex-col gap-[7px]">
          {STOCK_MIX.slices.map((s) => (
            <div key={s.name} className="flex items-center gap-2 text-[12.5px]">
              <span
                aria-hidden="true"
                className="h-[9px] w-[9px] flex-none rounded-[2px]"
                style={{ background: s.color }}
              />
              <span className="flex-1 text-soil">{s.name}</span>
              <Mono className="font-semibold text-ink">{s.pct}</Mono>
            </div>
          ))}
        </div>
      </div>
    </AdminCard>
  );
}
