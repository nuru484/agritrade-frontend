"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type RowSelectionState,
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  DataTablePagination,
  PAGE_SIZE_OPTIONS,
} from "@/components/ui/DataTablePagination";
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
 * The console data table (dms-frontend's TanStack + shadcn Table pattern in
 * the DB Plus skin). Screens own their search inputs and filters (pass the
 * query via `globalFilter`); the table owns sorting, selection and paging:
 *
 * - `enableSelection` injects the checkbox column; `renderBulkActions`
 *   receives the selected rows (and a clear function) and is rendered as a
 *   toolbar row while anything is selected — the home of "Delete selected".
 * - Pagination is the shared DataTablePagination footer with a rows-per-page
 *   selector, and — dms rule — it only appears once there are more rows than
 *   the smallest page size. Two items never get a pager.
 */
export function ConsoleDataTable<TData>({
  columns,
  data,
  itemNoun,
  pageSize: initialPageSize = 10,
  globalFilter = "",
  rowHref,
  rowClassName,
  emptyState,
  className,
  enableSelection = false,
  renderBulkActions,
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
  /** Adds the select-all / per-row checkboxes. */
  enableSelection?: boolean;
  /** Toolbar shown while rows are selected (bulk delete etc.). */
  renderBulkActions?: (
    selected: TData[],
    clearSelection: () => void,
  ) => React.ReactNode;
}) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pageSize, setPageSize] = useState(initialPageSize);

  const allColumns = useMemo<ColumnDef<TData, unknown>[]>(() => {
    if (!enableSelection) return columns;
    const select: ColumnDef<TData, unknown> = {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected()
              ? true
              : table.getIsSomePageRowsSelected()
                ? "indeterminate"
                : false
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all rows on this page"
          className="cursor-pointer border-slate-300"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          onClick={(e) => e.stopPropagation()}
          aria-label="Select row"
          className="cursor-pointer border-slate-300"
        />
      ),
      enableSorting: false,
      meta: { className: "w-9 pr-0" },
    };
    return [select, ...columns];
  }, [columns, enableSelection]);

  const table = useReactTable({
    data,
    columns: allColumns,
    state: { sorting, globalFilter, rowSelection },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: enableSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: "includesString",
    initialState: { pagination: { pageSize: initialPageSize } },
  });

  // Keep TanStack's page size in step with the footer's selector.
  useEffect(() => {
    table.setPageSize(pageSize);
  }, [pageSize, table]);

  const rows = table.getRowModel().rows;
  const total = table.getFilteredRowModel().rows.length;
  const { pageIndex } = table.getState().pagination;
  const selectedRows = table
    .getSelectedRowModel()
    .rows.map((r) => r.original);

  // dms rule: no pager for a page that couldn't possibly need one.
  const showPagination = total > Math.min(...PAGE_SIZE_OPTIONS);

  return (
    <div className={className}>
      {enableSelection && selectedRows.length > 0 && renderBulkActions ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-console/5 px-4 py-2">
          <span className="text-[12.5px] font-semibold text-slate-700">
            {selectedRows.length} selected
          </span>
          <div className="flex items-center gap-2">
            {renderBulkActions(selectedRows, () => setRowSelection({}))}
          </div>
        </div>
      ) : null}

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
              <TableCell colSpan={allColumns.length} className="p-0">
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
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  onClick={href ? () => router.push(href) : undefined}
                  className={cn(
                    "border-slate-100 data-[state=selected]:bg-console/5",
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

      {showPagination ? (
        <DataTablePagination
          totalCount={total}
          page={pageIndex + 1}
          pageSize={pageSize}
          selectedCount={selectedRows.length}
          itemNoun={itemNoun}
          onPageChange={(p) => table.setPageIndex(p - 1)}
          onPageSizeChange={setPageSize}
        />
      ) : total > 0 ? (
        <div className="border-t border-slate-200 px-4 py-2.5 text-[12.5px] text-slate-500">
          {total} {itemNoun}
        </div>
      ) : null}
    </div>
  );
}
