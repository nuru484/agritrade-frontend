import { AdminCard } from "@/components/admin/ui";
import { CASH_FLOW } from "@/static-data/admin/dashboard";

/** Chart geometry mirrors the design's 560×160 viewBox with an 8px inset. */
const W = 560;
const H = 160;
const PAD = 8;

function scale(salesIn: readonly number[], purchasesOut: readonly number[]) {
  const all = [...salesIn, ...purchasesOut];
  const min = Math.min(...all);
  const rng = Math.max(...all) - min || 1;
  const x = (i: number) => PAD + (i * (W - 2 * PAD)) / (salesIn.length - 1);
  const y = (v: number) => PAD + (H - 2 * PAD) * (1 - (v - min) / rng);
  return { x, y };
}

function toPoints(series: readonly number[], x: (i: number) => number, y: (v: number) => number) {
  return series.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
}

/** Least-squares fit over the sales series — the dashed trend line. */
function trendPoints(series: readonly number[], x: (i: number) => number, y: (v: number) => number) {
  let sx = 0;
  let sy = 0;
  let sxy = 0;
  let sxx = 0;
  series.forEach((v, i) => {
    sx += i;
    sy += v;
    sxy += i * v;
    sxx += i * i;
  });
  const n = series.length;
  const slope = (n * sxy - sx * sy) / (n * sxx - sx * sx);
  const intercept = (sy - slope * sx) / n;
  return `${x(0).toFixed(1)},${y(intercept).toFixed(1)} ${x(n - 1).toFixed(1)},${y(
    intercept + slope * (n - 1),
  ).toFixed(1)}`;
}

function LegendSwatch({ color, label, dashed }: { color?: string; label: string; dashed?: boolean }) {
  return (
    <span className="inline-flex items-center gap-[5px]">
      <span
        aria-hidden="true"
        className="w-2.5"
        style={
          dashed
            ? { height: 0, borderTop: "2px dashed #9ba6b3" }
            : { height: 2.5, borderRadius: 2, background: color }
        }
      />
      {label}
    </span>
  );
}

/** Cash flow — last 30 days: sales received vs purchases paid + trend. */
export function CashflowChart() {
  const { salesIn, purchasesOut, xLabels } = CASH_FLOW;
  const { x, y } = scale(salesIn, purchasesOut);
  const lineIn = toPoints(salesIn, x, y);
  const lineOut = toPoints(purchasesOut, x, y);
  const areaIn = `M${lineIn.split(" ").join(" L")} L${W - PAD},${H - PAD} L${PAD},${H - PAD} Z`;

  return (
    <AdminCard className="min-w-0 px-[18px] py-3.5">
      <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2.5">
        <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-700">
          Cash flow — last 30 days
        </div>
        <div className="flex flex-wrap gap-3.5 text-[11.5px] text-slate-500">
          <LegendSwatch color="#3E7A50" label="Sales received" />
          <LegendSwatch color="#3E6B8C" label="Purchases paid" />
          <LegendSwatch dashed label="Trend" />
        </div>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="block h-40 w-full"
        role="img"
        aria-label="Cash flow over the last 30 days: sales received versus purchases paid"
      >
        {[40, 80, 120].map((gy) => (
          <line key={gy} x1="0" y1={gy} x2={W} y2={gy} stroke="#F0F2F5" strokeWidth="1" />
        ))}
        <path d={areaIn} fill="rgba(62,122,80,0.09)" />
        <polyline
          points={trendPoints(salesIn, x, y)}
          fill="none"
          stroke="#9ba6b3"
          strokeWidth="1.5"
          strokeDasharray="5 4"
        />
        <polyline points={lineOut} fill="none" stroke="#3E6B8C" strokeWidth="2" strokeLinejoin="round" />
        <polyline points={lineIn} fill="none" stroke="#3E7A50" strokeWidth="2.5" strokeLinejoin="round" />
      </svg>
      <div className="mt-1.5 flex justify-between text-[11px] tabular-nums text-slate-400">
        {xLabels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </AdminCard>
  );
}
