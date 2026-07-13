import Link from "next/link";
import { cn } from "@/lib/utils";
import { Mono } from "@/components/admin/ui";
import { DASHBOARD_KPIS } from "@/static-data/admin/dashboard";

/** Scale a raw series into sparkline polyline points (design's toPts math). */
function sparkPoints(series: number[], w = 120, h = 26, pad = 3): string {
  const mn = Math.min(...series);
  const mx = Math.max(...series);
  const rng = mx - mn || 1;
  const sx = (w - 2 * pad) / (series.length - 1);
  return series
    .map(
      (v, i) =>
        `${(pad + i * sx).toFixed(1)},${(pad + (h - 2 * pad) * (1 - (v - mn) / rng)).toFixed(1)}`,
    )
    .join(" ");
}

/** The five headline cards — each one links into its module. */
export function KpiCards() {
  return (
    <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
      {DASHBOARD_KPIS.map((k) => (
        <Link
          key={k.label}
          href={k.href}
          className="rounded-none border-[1.5px] border border-soil/25 bg-paper px-4 py-3.5 hover:border-soil/35"
        >
          <div className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-soil">
            {k.label}
          </div>
          <Mono
            className={cn(
              "block whitespace-nowrap text-[22px] font-bold tracking-[-0.02em]",
              k.alert ? "text-console-red" : "text-ink",
            )}
          >
            {k.value}
          </Mono>
          <div className="mt-1 text-[12px] text-soil">{k.sub}</div>
          <svg
            viewBox="0 0 120 26"
            preserveAspectRatio="none"
            className="mt-2 block h-6 w-full"
            aria-hidden="true"
          >
            <polyline
              points={sparkPoints(k.series)}
              fill="none"
              stroke={k.alert ? "#E0B4AE" : "#C9CFD8"}
              strokeWidth="1.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>
        </Link>
      ))}
    </div>
  );
}
