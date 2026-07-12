"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CheckSquare,
  Database,
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

/**
 * The one table-pagination footer (dms-frontend's design in the console
 * skin): total/selected counts, a rows-per-page selector so the page size is
 * never fixed, the showing X–Y of Z range, and first/prev/next/last
 * controls. Driven by plain props so it works for client-side tables today
 * and server-paginated ones later.
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

  const navButton =
    "flex h-8 w-8 cursor-pointer items-center justify-center border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-3 border-t border-slate-200 bg-white px-4 py-3 text-[12.5px] text-slate-500 lg:justify-between",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-center gap-3.5">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 flex-none items-center justify-center rounded-[4px] bg-console/10">
            {isSelected ? (
              <CheckSquare className="h-3.5 w-3.5 text-console" aria-hidden="true" />
            ) : (
              <Database className="h-3.5 w-3.5 text-console/70" aria-hidden="true" />
            )}
          </span>
          <span className="whitespace-nowrap">
            {isSelected ? (
              <>
                <span className="font-semibold text-slate-800">
                  {selectedCount.toLocaleString()}
                </span>{" "}
                selected ·{" "}
                <span className="font-semibold text-slate-800">
                  {totalCount.toLocaleString()}
                </span>{" "}
                total
              </>
            ) : (
              <>
                <span className="font-semibold text-slate-800">
                  {totalCount.toLocaleString()}
                </span>{" "}
                {itemNoun}
              </>
            )}
          </span>
        </div>

        <label className="flex items-center gap-2 whitespace-nowrap">
          <span className="hidden sm:inline">Rows per page</span>
          <span className="sm:hidden">Rows</span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => onPageSizeChange(Number(v))}
          >
            <SelectTrigger
              aria-label="Rows per page"
              className="h-8 w-auto min-w-[58px] cursor-pointer rounded-[6px] border-slate-200 bg-white px-2 text-[12.5px] text-slate-700"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="min-w-[58px]">
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={String(size)} className="cursor-pointer">
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <span className="whitespace-nowrap">
          Showing{" "}
          <span className="font-semibold text-slate-800">
            {startItem.toLocaleString()}
          </span>
          –
          <span className="font-semibold text-slate-800">
            {endItem.toLocaleString()}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-slate-800">
            {totalCount.toLocaleString()}
          </span>
        </span>

        <nav className="flex items-center" aria-label="Pagination">
          <button
            type="button"
            className={cn(navButton, "hidden rounded-l-[6px] md:flex")}
            onClick={() => onPageChange(1)}
            disabled={page <= 1}
            aria-label="First page"
          >
            <ChevronsLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            className={cn(navButton, "-ml-px rounded-l-[6px] md:rounded-l-none")}
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <span className="font-adminmono -ml-px flex h-8 items-center whitespace-nowrap border border-slate-200 bg-slate-50 px-3 text-[12px] font-semibold text-slate-700">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            className={cn(navButton, "-ml-px")}
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            className={cn(navButton, "-ml-px hidden rounded-r-[6px] md:flex")}
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
