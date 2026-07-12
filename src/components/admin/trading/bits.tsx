import Link from "next/link";
import { Mono, TONES, type Tone } from "@/components/admin/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { LedgerRow, MetaItem, TimelineItem } from "@/static-data/admin/trading";
import { cn } from "@/lib/utils";

/**
 * Presentational pieces shared by the trading screens (registers + details):
 * micro status chips, ledgers, meta lists and activity timelines — all styled
 * to the console design's exact sizes.
 */

/** Uppercase micro status chip used in register rows and detail headers. */
export function StatusChip({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  const t = TONES[tone];
  return (
    <span
      className="inline-flex items-center gap-[5px] whitespace-nowrap rounded-full px-[9px] py-[3px] text-[10px] font-bold uppercase tracking-[0.08em]"
      style={{ color: t.fg, background: t.bg }}
    >
      <span aria-hidden="true" className="h-[5px] w-[5px] flex-none rounded-full" style={{ background: t.dot }} />
      {children}
    </span>
  );
}

export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="mb-2.5 inline-block text-[13px] font-semibold text-console hover:underline">
      ← {children}
    </Link>
  );
}

/** Small-caps section label inside detail cards. */
export function SectionLabel({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("text-[11px] font-bold uppercase tracking-[0.1em] text-slate-700", className)}>{children}</div>
  );
}

/** Detail-header figure: small-caps label over a large mono value. */
export function HeaderFigure({
  label,
  mono = true,
  className,
  children,
}: {
  label: string;
  mono?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-slate-500">{label}</div>
      {mono ? (
        <Mono className={cn("text-[19px] font-bold", className)}>{children}</Mono>
      ) : (
        <div className={cn("pt-[3px] text-[15px] font-semibold", className)}>{children}</div>
      )}
    </div>
  );
}

/** Key → value rows in the right rail. */
export function MetaList({ items }: { items: MetaItem[] }) {
  return (
    <div>
      {items.map((row) => (
        <div key={row.k} className="flex justify-between gap-3 py-[5px] text-[13px]">
          <span className="text-slate-500">{row.k}</span>
          <span className="text-right font-medium text-slate-800">{row.v}</span>
        </div>
      ))}
    </div>
  );
}

/** Dotted activity feed; the last item's connector line is hidden. */
export function ActivityTimeline({ items }: { items: TimelineItem[] }) {
  return (
    <div className="flex flex-col">
      {items.map((item, i) => (
        <div key={`${item.what}-${i}`} className="flex gap-2.5">
          <div className="flex flex-col items-center">
            <span
              className="mt-[5px] h-2 w-2 flex-none rounded-full"
              style={{ background: TONES[item.tone].dot }}
            />
            {i < items.length - 1 ? <span className="min-h-3.5 w-[1.5px] flex-1 bg-[#E2E5EA]" /> : null}
          </div>
          <div className="min-w-0 pb-3.5">
            <div className="text-[13px] text-slate-800">{item.what}</div>
            <div className="mt-px text-[11.5px] text-slate-500">{item.meta}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

const LEDGER_AMOUNT_COLOR: Record<LedgerRow["direction"], string> = {
  credit: "#2F5E3D",
  debit: "#B03A2E",
  pending: "#7A5407",
};

/** Shared th/td skins for the console statement tables (exact grid sizes). */
const ledgerHeadClass = "h-8 py-0 text-[10px] font-bold uppercase tracking-[0.09em] text-slate-500";

/** Date / Description / Amount / running-figure ledger used by purchase float
 * movement and sale payments. */
export function LedgerTable({ rows, afterLabel }: { rows: LedgerRow[]; afterLabel: string }) {
  return (
    <Table className="text-[13px]">
      <TableHeader>
        <TableRow className="border-slate-200 bg-slate-50 hover:bg-slate-50">
          <TableHead className={cn(ledgerHeadClass, "w-[118px] pl-5 pr-1.5 lg:w-[122px]")}>Date</TableHead>
          <TableHead className={cn(ledgerHeadClass, "px-1.5")}>Description</TableHead>
          <TableHead className={cn(ledgerHeadClass, "w-[146px] pl-1.5 pr-5 text-right lg:w-[142px] lg:pr-1.5")}>
            Amount
          </TableHead>
          <TableHead className={cn(ledgerHeadClass, "hidden w-[156px] pl-1.5 pr-5 text-right lg:table-cell")}>
            {afterLabel}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="[&_tr:last-child]:border-b">
        {rows.map((row, i) => (
          <TableRow key={`${row.date}-${i}`} className="h-[42px] border-slate-100 hover:bg-transparent">
            <TableCell className="whitespace-nowrap py-0 pl-5 pr-1.5 text-slate-600">{row.date}</TableCell>
            <TableCell className="w-full max-w-0 px-1.5 py-0">
              <span className="flex min-w-0 items-center gap-2 overflow-hidden text-slate-800">
                <span className="truncate">{row.desc}</span>
                {row.pending ? (
                  <span className="inline-flex flex-none items-center rounded-full bg-[#F7EED8] px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.08em] text-[#7A5407]">
                    Pending
                  </span>
                ) : null}
              </span>
            </TableCell>
            <TableCell className="whitespace-nowrap py-0 pl-1.5 pr-5 text-right lg:pr-1.5">
              <Mono className="font-semibold">
                <span style={{ color: LEDGER_AMOUNT_COLOR[row.direction] }}>{row.amount}</span>
              </Mono>
            </TableCell>
            <TableCell className="hidden whitespace-nowrap py-0 pl-1.5 pr-5 text-right lg:table-cell">
              <Mono className="text-slate-500">{row.after}</Mono>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

/** 26px icon-only row action. */
export function RowIconButton({
  title,
  danger,
  onClick,
  children,
}: {
  title: string;
  danger?: boolean;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      className={cn(
        "inline-flex h-[26px] w-[26px] cursor-pointer items-center justify-center rounded-[5px]",
        danger ? "text-console-red hover:bg-[#F8E9E7]" : "text-slate-500 hover:bg-slate-100 hover:text-console",
      )}
    >
      {children}
    </button>
  );
}
