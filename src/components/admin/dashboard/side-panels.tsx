import { AdminCard, Mono } from "@/components/admin/ui";
import { AGENT_FLOATS, STOCK_BY_COMMODITY } from "@/static-data/admin/dashboard";

/** Deterministic initials avatar (the design's avatarOf hash + palette). */
function avatarOf(name: string): { init: string; bg: string; fg: string } {
  const pal = [
    { bg: "#E7EEE9", fg: "#1E3D2B" },
    { bg: "#E8EFF4", fg: "#33587A" },
    { bg: "#F7EED8", fg: "#7A5407" },
    { bg: "#ECEFF3", fg: "#4c5765" },
    { bg: "#F0E9E0", fg: "#6B4A2C" },
  ];
  let h = 0;
  for (let i = 0; i < name.length; i++) h += name.charCodeAt(i);
  const words = name.replace(/[^A-Za-z ]/g, "").trim().split(/\s+/);
  const init = `${(words[0] ?? "?")[0]}${(words[1] ?? "")[0] ?? ""}`.toUpperCase();
  return { init, ...pal[h % pal.length] };
}

/** Stock by commodity — on-hand kilograms per commodity. */
export function StockByCommodity() {
  return (
    <AdminCard className="overflow-hidden">
      <div className="border-b border-soil/15 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.1em] text-soil">
        Stock by commodity
      </div>
      {STOCK_BY_COMMODITY.map((s) => (
        <div
          key={s.name}
          className="flex items-center justify-between gap-2.5 border-b border-soil/15 px-4 py-2.5 last:border-b-0"
        >
          <span className="text-[13px] text-ink">{s.name}</span>
          <Mono className="text-[13px] font-semibold text-ink">{s.kg}</Mono>
        </div>
      ))}
    </AdminCard>
  );
}

/** Agent floats — cash held per agent, flagged when the agent has fronted. */
export function AgentFloats() {
  return (
    <AdminCard className="overflow-hidden">
      <div className="border-b border-soil/15 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.1em] text-soil">
        Agent floats
      </div>
      {AGENT_FLOATS.map((f) => {
        const av = avatarOf(f.name);
        return (
          <div
            key={f.name}
            className="flex items-center justify-between gap-2.5 border-b border-soil/15 px-4 py-2.5 last:border-b-0"
          >
            <div className="flex min-w-0 items-center gap-2">
              <span
                aria-hidden="true"
                className="inline-flex h-6 w-6 flex-none items-center justify-center rounded-full text-[10px] font-bold"
                style={{ background: av.bg, color: av.fg }}
              >
                {av.init}
              </span>
              <div className="min-w-0">
                <div className="overflow-hidden text-ellipsis whitespace-nowrap text-[13px] text-ink">
                  {f.name}
                </div>
                {f.fronted ? (
                  <span className="mt-[3px] inline-flex items-center rounded-full bg-[#F8E9E7] px-[7px] py-0.5 text-[9.5px] font-bold uppercase tracking-[0.08em] text-console-red-deep">
                    Agent fronted
                  </span>
                ) : null}
              </div>
            </div>
            {/* Colour keys off the balance: gold when low, red when fronted. */}
            <Mono className="whitespace-nowrap text-[13px] font-semibold">
              <span style={{ color: f.amountColor }}>{f.amount}</span>
            </Mono>
          </div>
        );
      })}
    </AdminCard>
  );
}
