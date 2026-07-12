"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminButton } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

/** Per-column console styling carried on TanStack column meta. */
export interface ConsoleColumnMeta {
  /** Applied to both th and td (alignment, mono, responsive hiding). */
  className?: string;
  /** Applied to th only. */
  headerClassName?: string;
}

declare module "@tanstack/react-table" {
  // The standard TanStack meta-augmentation shape — params/emptiness required.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-object-type
  interface ColumnMeta<TData, TValue> extends ConsoleColumnMeta {}
}

/**
 * The console data table (dms-frontend's TanStack + shadcn Table pattern,
 * worn in the Nasara console skin): client-side sorting/filtering/paging over
 * stub data — the same surface the backend hookup will drive manually later.
 * Screens own their search inputs and filters; pass the query via
 * `globalFilter` and row semantics via `rowHref`/`rowClassName`.
 */
export function ConsoleDataTable<TData>({
  columns,
  data,
  itemNoun,
  pageSize = 10,
  globalFilter = "",
  rowHref,
  rowClassName,
  emptyState,
  className,
}: {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  /** Plural noun for the footer, e.g. "purchases". */
  itemNoun: string;
  pageSize?: number;
  globalFilter?: string;
  /** Row click / keyboard navigation target. */
  rowHref?: (row: TData) => string | undefined;
  rowClassName?: (row: TData) => string | undefined;
  emptyState?: React.ReactNode;
  className?: string;
}) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: "includesString",
    initialState: { pagination: { pageSize } },
  });

  const rows = table.getRowModel().rows;
  const total = table.getFilteredRowModel().rows.length;
  const { pageIndex } = table.getState().pagination;
  const from = total === 0 ? 0 : pageIndex * pageSize + 1;
  const to = Math.min((pageIndex + 1) * pageSize, total);

  return (
    <div className={className}>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="border-slate-200 hover:bg-transparent"
            >
              {headerGroup.headers.map((header) => {
                const meta = header.column.columnDef.meta;
                const sortable = header.column.getCanSort();
                const dir = header.column.getIsSorted();
                return (
                  <TableHead
                    key={header.id}
                    className={cn(
                      "h-auto px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400",
                      sortable && "cursor-pointer select-none",
                      meta?.className,
                      meta?.headerClassName,
                    )}
                    onClick={
                      sortable
                        ? header.column.getToggleSortingHandler()
                        : undefined
                    }
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                    {dir === "asc" ? " ↑" : dir === "desc" ? " ↓" : null}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columns.length} className="p-0">
                {emptyState ?? (
                  <div className="px-4 py-12 text-center text-[13px] text-slate-500">
                    Nothing here yet.
                  </div>
                )}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => {
              const href = rowHref?.(row.original);
              return (
                <TableRow
                  key={row.id}
                  onClick={href ? () => router.push(href) : undefined}
                  className={cn(
                    "border-slate-100",
                    href && "cursor-pointer hover:bg-slate-50",
                    rowClassName?.(row.original),
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        "px-3 py-3 text-[13.5px] text-slate-800",
                        cell.column.columnDef.meta?.className,
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-3 py-3">
        <span className="text-[12.5px] text-slate-500">
          Showing {from}–{to} of {total} {itemNoun}
        </span>
        <div className="flex gap-2">
          <AdminButton
            variant="secondary"
            className="h-8 px-3 text-[12.5px]"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
          >
            ← Prev
          </AdminButton>
          <AdminButton
            variant="secondary"
            className="h-8 px-3 text-[12.5px]"
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
          >
            Next →
          </AdminButton>
        </div>
      </div>
    </div>
  );
}
