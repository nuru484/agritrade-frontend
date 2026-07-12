"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Windowed page numbers: 1 … around-current … last. */
function pageWindow(page: number, totalPages: number): (number | "…")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const around = [page - 1, page, page + 1].filter(
    (p) => p > 1 && p < totalPages,
  );
  const out: (number | "…")[] = [1];
  if ((around[0] ?? totalPages) > 2) out.push("…");
  out.push(...around);
  if ((around.at(-1) ?? 1) < totalPages - 1) out.push("…");
  out.push(totalPages);
  return out;
}

/**
 * Numbered pagination for plain lists (cards, grids — anything that isn't a
 * data table). Hides itself entirely for a single page, dms-frontend style.
 */
export function ListPagination({
  page,
  totalPages,
  onPageChange,
  className,
}: {
  /** 1-based current page. */
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}) {
  if (totalPages <= 1) return null;

  const button =
    "flex h-8 min-w-8 cursor-pointer items-center justify-center rounded-[6px] border px-2 text-[12.5px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex flex-wrap items-center justify-center gap-1.5", className)}
    >
      <button
        type="button"
        className={cn(button, "border-slate-200 bg-white text-slate-600 hover:bg-slate-50")}
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
      </button>
      {pageWindow(page, totalPages).map((p, i) =>
        p === "…" ? (
          <span key={`gap-${String(i)}`} className="px-1 text-slate-400">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            aria-current={p === page ? "page" : undefined}
            onClick={() => onPageChange(p)}
            className={cn(
              button,
              p === page
                ? "border-console bg-console text-white"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
            )}
          >
            {p}
          </button>
        ),
      )}
      <button
        type="button"
        className={cn(button, "border-slate-200 bg-white text-slate-600 hover:bg-slate-50")}
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </nav>
  );
}
