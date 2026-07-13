import { AdminCard } from "@/components/admin/ui";
import { WEEKLY_VOLUME } from "@/static-data/admin/dashboard";

/** Tallest stack fills 146px of the 150px track (design's bar scaling). */
const TRACK = 146;

function LegendSwatch({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-[5px]">
      <span aria-hidden="true" className="h-2 w-2 rounded-[2px]" style={{ background: color }} />
      {label}
    </span>
  );
}

/** Weekly volume bought — stacked maize/soybeans/shea bars with tooltips. */
export function VolumeBars() {
  const max = Math.max(...WEEKLY_VOLUME.map((w) => w.maize + w.soybeans + w.shea));
  const px = (t: number) => Math.round((t / max) * TRACK);

  return (
    <AdminCard className="min-w-0 px-[18px] py-3.5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2.5">
        <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-soil">
          Weekly volume bought
        </div>
        <div className="flex flex-wrap gap-3 text-[11.5px] text-soil">
          <LegendSwatch color="#1E3D2B" label="Maize" />
          <LegendSwatch color="#3E6B8C" label="Soybeans" />
          <LegendSwatch color="#B8860B" label="Shea" />
        </div>
      </div>
      <div className="flex h-[150px] items-end gap-2.5">
        {WEEKLY_VOLUME.map((w) => (
          <div
            key={w.label}
            className="flex h-full flex-1 flex-col items-stretch justify-end"
            title={`${w.label} — maize ${w.maize}t · soy ${w.soybeans}t · shea ${w.shea}t`}
          >
            <div className="rounded-t-[2px]" style={{ height: px(w.shea), background: "#B8860B" }} />
            <div style={{ height: px(w.soybeans), background: "#3E6B8C" }} />
            <div className="rounded-b-[2px]" style={{ height: px(w.maize), background: "#1E3D2B" }} />
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex gap-2.5">
        {WEEKLY_VOLUME.map((w) => (
          <span
            key={w.label}
            className="flex-1 whitespace-nowrap text-center text-[10.5px] tabular-nums text-soil/70"
          >
            {w.label}
          </span>
        ))}
      </div>
    </AdminCard>
  );
}
