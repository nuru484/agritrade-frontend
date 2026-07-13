"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const PAGE_SIZE_OPTIONS = [5, 10, 20, 30, 50, 100] as const;

const microLabel =
  "stencil text-[10.5px] uppercase tracking-[0.14em] text-harvest-deep";

/** Zero-pads a page number to the ledger width ("02 ∕ 12"). */
const pad = (n: number, width: number) => String(n).padStart(width, "0");

/**
 * The one table-pagination footer, in the DB Plus ledger idiom: a diamond
 * count marker with mono figures, a dashed-underline rows-per-page control,
 * the showing range in micro-label + mono, and round ghost nav around a
 * zero-padded page readout with a progress track showing how far through the
 * ledger you are. Driven by plain props so it works for client-side tables
 * today and server-paginated ones later.
 */
export function DataTablePagination({
  totalCount,
  page,
  pageSize,
  selectedCount = 0,
  itemNoun = "rows",
  onPageChange,
  onPageSizeChange,
  className,
}: {
  totalCount: number;
  /** 1-based current page. */
  page: number;
  pageSize: number;
  selectedCount?: number;
  itemNoun?: string;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  className?: string;
}) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const startItem = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalCount);
  const isSelected = selectedCount > 0;
  const padWidth = Math.max(2, String(totalPages).length);

  const navButton =
    "flex h-7 w-7 flex-none cursor-pointer items-center justify-center rounded-full text-soil transition-colors hover:bg-console/10 hover:text-console disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-soil";

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5 border-t border-soil/25 bg-surface-alt/60 px-4 py-2.5 text-soil lg:justify-between",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
        <span className="flex items-center gap-2 whitespace-nowrap">
          <span
            aria-hidden="true"
            className={cn(
              "h-1.5 w-1.5 flex-none rotate-45",
              isSelected ? "bg-console" : "bg-console/40",
            )}
          />
          {isSelected ? (
            <>
              <span className="font-adminmono text-[13px] font-bold text-console">
                {selectedCount.toLocaleString()}
              </span>
              <span className={microLabel}>selected</span>
              <span aria-hidden="true" className="h-3 w-px bg-soil/20" />
              <span className="font-adminmono text-[13px] font-semibold text-soil">
                {totalCount.toLocaleString()}
              </span>
              <span className={microLabel}>total</span>
            </>
          ) : (
            <>
              <span className="font-adminmono text-[13px] font-bold text-ink">
                {totalCount.toLocaleString()}
              </span>
              <span className={microLabel}>{itemNoun}</span>
            </>
          )}
        </span>

        <label className="flex items-center gap-1.5 whitespace-nowrap">
          <span className={microLabel}>Rows</span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => onPageSizeChange(Number(v))}
          >
            <SelectTrigger
              aria-label="Rows per page"
              className="font-adminmono h-7 w-auto min-w-0 cursor-pointer gap-1 rounded-none border-0 border-b border-dashed border-soil/35 bg-transparent px-0.5 text-[12.5px] font-bold text-soil shadow-none transition-colors hover:border-console hover:text-console focus:ring-0 focus-visible:ring-0"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="min-w-[64px]">
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem
                  key={size}
                  value={String(size)}
                  className="cursor-pointer"
                >
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        <span className="flex items-baseline gap-1.5 whitespace-nowrap">
          <span className={microLabel}>Showing</span>
          <span className="font-adminmono text-[12.5px] font-semibold text-soil">
            {startItem.toLocaleString()}–{endItem.toLocaleString()}
          </span>
          <span className={microLabel}>of</span>
          <span className="font-adminmono text-[12.5px] font-semibold text-soil">
            {totalCount.toLocaleString()}
          </span>
        </span>

        <nav className="flex items-center gap-0.5" aria-label="Pagination">
          <button
            type="button"
            className={cn(navButton, "hidden md:flex")}
            onClick={() => onPageChange(1)}
            disabled={page <= 1}
            aria-label="First page"
          >
            <ChevronsLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            className={navButton}
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <span className="mx-1.5 flex flex-col items-center gap-[5px]">
            <span className="font-adminmono whitespace-nowrap text-[11.5px] font-bold leading-none tracking-[0.08em]">
              <span className="text-console">{pad(page, padWidth)}</span>
              <span className="text-soil/45"> ∕ </span>
              <span className="text-soil">{pad(totalPages, padWidth)}</span>
            </span>
            <span
              aria-hidden="true"
              className="h-[3px] w-16 overflow-hidden rounded-full bg-soil/20"
            >
              <span
                className="block h-full rounded-full bg-console transition-all duration-300"
                style={{ width: `${String((page / totalPages) * 100)}%` }}
              />
            </span>
          </span>
          <button
            type="button"
            className={navButton}
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            className={cn(navButton, "hidden md:flex")}
            onClick={() => onPageChange(totalPages)}
            disabled={page >= totalPages}
            aria-label="Last page"
          >
            <ChevronsRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </nav>
      </div>
    </div>
  );
}
