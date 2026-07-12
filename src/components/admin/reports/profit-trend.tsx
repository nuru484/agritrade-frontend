import { AdminCard } from "@/components/admin/ui";
import { PROFIT_TREND } from "@/static-data/admin/reports";

/**
 * 560×150 viewBox, 8px inset, zero-based y scale pegged to peak revenue —
 * both series share it so profit reads honestly against revenue.
 */
const W = 560;
const H = 150;
const PAD = 8;

function toPoints(series: readonly number[], max: number): string {
  const x = (i: number) => PAD + (i * (W - 2 * PAD)) / (series.length - 1);
  const y = (v: number) => PAD + (H - 2 * PAD) * (1 - v / max);
  return series.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
}

function LegendSwatch({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-[5px]">
      <span
        aria-hidden="true"
        className="h-[2.5px] w-2.5 rounded-[2px]"
        style={{ background: color }}
      />
      {label}
    </span>
  );
}

/** Revenue & net profit — 6 months. */
export function ProfitTrend() {
  const { revenue, netProfit, xLabels } = PROFIT_TREND;
  const max = Math.max(...revenue) || 1;
  const revPts = toPoints(revenue, max);
  const profPts = toPoints(netProfit, max);
  const profArea = `M${profPts.split(" ").join(" L")} L${W - PAD},${H - PAD} L${PAD},${H - PAD} Z`;

  return (
    <AdminCard className="min-w-0 rounded-lg px-[18px] py-3.5">
      <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2.5">
        <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-700">
          Revenue &amp; net profit — 6 months
        </div>
        <div className="flex flex-wrap gap-3.5 text-[11.5px] text-slate-500">
          <LegendSwatch color="#3E6B8C" label="Revenue" />
          <LegendSwatch color="#3E7A50" label="Net profit" />
        </div>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="block h-[150px] w-full"
        role="img"
        aria-label="Revenue and net profit over the last six months"
      >
        {[37, 75, 112].map((gy) => (
          <line key={gy} x1="0" y1={gy} x2={W} y2={gy} stroke="#F0F2F5" strokeWidth="1" />
        ))}
        <path d={profArea} fill="rgba(62,122,80,0.09)" />
        <polyline points={revPts} fill="none" stroke="#3E6B8C" strokeWidth="2" strokeLinejoin="round" />
        <polyline points={profPts} fill="none" stroke="#3E7A50" strokeWidth="2.5" strokeLinejoin="round" />
      </svg>
      <div className="mt-1.5 flex justify-between text-[11px] text-slate-400">
        {xLabels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </AdminCard>
  );
}
