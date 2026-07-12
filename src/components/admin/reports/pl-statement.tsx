import { cn } from "@/lib/utils";
import { AdminCard, Mono } from "@/components/admin/ui";
import { PL_ROWS } from "@/static-data/admin/reports";

/** Profit & loss — Jun 2026: section lines, indented detail, tinted totals. */
export function PlStatement() {
  return (
    <AdminCard className="overflow-hidden rounded-lg">
      <div className="border-b border-slate-100 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-700">
        Profit &amp; loss — Jun 2026
      </div>
      {PL_ROWS.map((row) => (
        <div
          key={row.label}
          className={cn(
            "flex items-center justify-between gap-3 border-b border-slate-100 py-2.5 pr-5 text-[13px] last:border-b-0",
            row.indent ? "pl-[34px]" : "pl-5",
            row.emphasis === "subtotal" && "bg-slate-50/70",
            row.emphasis === "net" && "bg-[#E6F0E9]",
          )}
        >
          <span
            className={cn(
              "flex items-center gap-2",
              row.indent && "font-normal text-slate-500",
              !row.indent && !row.emphasis && "font-semibold text-slate-900",
              row.emphasis === "subtotal" && "font-bold text-slate-900",
              row.emphasis === "net" && "font-bold text-console",
            )}
          >
            {row.label}
            {row.est ? (
              <span className="inline-flex items-center rounded-full border border-console-gold px-[7px] py-px text-[9.5px] font-bold uppercase tracking-[0.08em] text-[#7A5407]">
                Est.
              </span>
            ) : null}
          </span>
          <Mono
            className={cn(
              "whitespace-nowrap",
              row.indent && "font-normal text-slate-600",
              !row.indent && !row.emphasis && "font-semibold",
              row.emphasis && "font-bold",
              row.negative
                ? "text-console-red-deep"
                : row.emphasis === "net"
                  ? "text-[#2F5E3D]"
                  : !row.indent
                    ? "text-slate-900"
                    : undefined,
            )}
          >
            {row.amount}
          </Mono>
        </div>
      ))}
    </AdminCard>
  );
}
