"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { AdminButton, Mono } from "@/components/admin/ui";
import { ConsoleDataTable } from "@/components/admin/data-table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { notify } from "@/lib/notify";
import { cn } from "@/lib/utils";
import { formatCedis, formatKg } from "@/lib/format-money";
import {
  purchaseAgents,
  purchaseCommodities,
  purchaseRows,
  purchaseTotal,
  type PurchaseRow,
} from "@/static-data/admin/trading";
import { RowIconButton, StatusChip } from "./bits";
import { VoidPurchaseDialog } from "./void-purchase-dialog";

/** Spec-only state switcher from the design — lets every table state be previewed. */
type TableState = "loaded" | "loading" | "empty" | "filtered" | "error";

const TABLE_STATES: { key: TableState; label: string }[] = [
  { key: "loaded", label: "Loaded" },
  { key: "loading", label: "Loading" },
  { key: "empty", label: "Empty" },
  { key: "filtered", label: "Filtered-empty" },
  { key: "error", label: "Error" },
];

const ANY = "__any__";

const filterSelectClass =
  "h-8 cursor-pointer rounded-[6px] border border-soil/25 bg-paper px-2.5 text-[13px] text-soil shadow-none outline-none hover:border-soil/35 focus:border-console focus-visible:border-console focus-visible:ring-0";

/** Console register header cell — pinned over the data table's defaults. */
const headClass = "h-[38px] bg-surface-alt/70 py-0 text-[10.5px] font-bold tracking-[0.09em] text-soil";

function EditIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M11.3 2.2 13.8 4.7 5.5 13 2.5 13.5 3 10.5 11.3 2.2Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

function DuplicateIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10.5 3.5v-1a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h1" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function PrintIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 6V2h8v4M4 12h8v3H4v-3Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <rect x="2" y="6" width="12" height="6" rx="1" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function VoidIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3.8 3.8 12.2 12.2" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function Shimmer({ className }: { className?: string }) {
  return <Skeleton className={cn("rounded-[4px] bg-soil/20", className)} />;
}

export function PurchasesRegister() {
  const router = useRouter();
  const [rows, setRows] = useState<PurchaseRow[]>(purchaseRows);
  const [tableState, setTableState] = useState<TableState>("loaded");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(ANY);
  const [commodity, setCommodity] = useState(ANY);
  const [agent, setAgent] = useState(ANY);
  const [dateRange, setDateRange] = useState("Last 30 days");
  const [voidTarget, setVoidTarget] = useState<PurchaseRow | null>(null);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (!q || r.ref.toLowerCase().includes(q) || r.supplier.toLowerCase().includes(q)) &&
        (status === ANY || r.status === status) &&
        (commodity === ANY || r.commodity === commodity) &&
        (agent === ANY || r.agent === agent),
    );
  }, [rows, search, status, commodity, agent]);

  const clearFilters = () => {
    setSearch("");
    setStatus(ANY);
    setCommodity(ANY);
    setAgent(ANY);
    setTableState("loaded");
  };

  const confirmVoid = (purchase: PurchaseRow) => {
    setRows((rs) => rs.map((r) => (r.ref === purchase.ref ? { ...r, status: "Voided", tone: "slate" } : r)));
    setVoidTarget(null);
    notify.success(`Purchase ${purchase.ref} voided — float reversed`);
  };

  const columns = useMemo<ColumnDef<PurchaseRow, unknown>[]>(
    () => [
      {
        accessorKey: "ref",
        header: "Ref",
        enableSorting: false,
        meta: { className: "w-[86px] py-0 pl-4 pr-1.5 text-[13px] xl:w-[84px]", headerClassName: headClass },
        cell: ({ row }) => (
          <Mono className="text-[12.5px] font-semibold text-console">{row.original.ref}</Mono>
        ),
      },
      {
        accessorKey: "date",
        header: "Date ↓",
        enableSorting: false,
        meta: {
          className: "w-[90px] whitespace-nowrap px-1.5 py-0 text-[13px] text-soil xl:w-[92px]",
          headerClassName: headClass,
        },
      },
      {
        accessorKey: "agent",
        header: "Agent",
        enableSorting: false,
        meta: {
          className: "hidden px-1.5 py-0 text-[13px] text-ink xl:table-cell",
          headerClassName: headClass,
        },
        cell: ({ row }) => <span className="block truncate">{row.original.agent}</span>,
      },
      {
        accessorKey: "supplier",
        header: "Supplier",
        enableSorting: false,
        meta: { className: "px-1.5 py-0 text-[13px] text-ink", headerClassName: headClass },
        cell: ({ row }) => <span className="block truncate">{row.original.supplier}</span>,
      },
      {
        accessorKey: "commodity",
        header: "Commodity",
        enableSorting: false,
        meta: {
          className: "hidden px-1.5 py-0 text-[13px] text-soil xl:table-cell",
          headerClassName: headClass,
        },
        cell: ({ row }) => <span className="block truncate">{row.original.commodity}</span>,
      },
      {
        accessorKey: "weightKg",
        header: "Weight",
        enableSorting: false,
        meta: { className: "w-[90px] px-1.5 py-0 text-right text-[13px]", headerClassName: headClass },
        cell: ({ row }) => (
          <Mono className="whitespace-nowrap text-ink">{formatKg(row.original.weightKg)}</Mono>
        ),
      },
      {
        accessorKey: "pricePerKg",
        header: "Price/kg",
        enableSorting: false,
        meta: {
          className: "hidden w-[86px] px-1.5 py-0 text-right text-[13px] xl:table-cell",
          headerClassName: headClass,
        },
        cell: ({ row }) => (
          <Mono className="whitespace-nowrap text-soil">{formatCedis(row.original.pricePerKg)}</Mono>
        ),
      },
      {
        id: "total",
        header: "Total",
        enableSorting: false,
        accessorFn: (row) => purchaseTotal(row),
        meta: {
          className: "w-[110px] px-1.5 py-0 text-right text-[13px] xl:w-[108px]",
          headerClassName: headClass,
        },
        cell: ({ row }) => (
          <Mono
            className={cn(
              "whitespace-nowrap font-semibold",
              row.original.status === "Voided" ? "text-soil/70 line-through" : "text-ink",
            )}
          >
            {formatCedis(purchaseTotal(row.original))}
          </Mono>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        enableSorting: false,
        meta: {
          className: "w-[122px] py-0 pl-1.5 pr-4 text-[13px] xl:w-[116px] xl:pr-1.5",
          headerClassName: headClass,
        },
        cell: ({ row }) => <StatusChip tone={row.original.tone}>{row.original.status}</StatusChip>,
      },
      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        meta: {
          className: "hidden py-0 pl-1.5 pr-4 text-right text-[13px] xl:w-[130px] xl:table-cell",
          headerClassName: headClass,
        },
        cell: ({ row }) => {
          const p = row.original;
          return (
            <span className="flex justify-end gap-[3px]">
              <RowIconButton
                title="Edit purchase"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/admin/purchases/new?edit=${p.ref}`);
                }}
              >
                <EditIcon />
              </RowIconButton>
              <RowIconButton
                title="Duplicate as new purchase"
                onClick={(e) => {
                  e.stopPropagation();
                  notify.info(`Prefilled from ${p.ref} — review and record`);
                  router.push(`/admin/purchases/new?from=${p.ref}`);
                }}
              >
                <DuplicateIcon />
              </RowIconButton>
              <RowIconButton
                title="Print goods-received note"
                onClick={(e) => {
                  e.stopPropagation();
                  notify.info(`Goods-received note for ${p.ref} sent to print`);
                }}
              >
                <PrintIcon />
              </RowIconButton>
              <RowIconButton
                title="Void purchase"
                danger
                onClick={(e) => {
                  e.stopPropagation();
                  setVoidTarget(p);
                }}
              >
                <VoidIcon />
              </RowIconButton>
            </span>
          );
        },
      },
    ],
    [router],
  );

  const showFilterBar = tableState === "loaded" || tableState === "filtered" || tableState === "loading";
  const filteredEmpty = tableState === "filtered" || (tableState === "loaded" && visible.length === 0);

  return (
    <div>
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold tracking-[-0.01em] text-ink">Purchases</h1>
          <div className="mt-0.5 text-[13px] text-soil">Goods bought from suppliers and farmers</div>
        </div>
        <AdminButton className="h-[34px] whitespace-nowrap" onClick={() => router.push("/admin/purchases/new")}>
          + Record purchase
        </AdminButton>
      </div>

      <Tabs
        value={tableState}
        onValueChange={(v) => setTableState(v as TableState)}
        className="mb-3.5 w-fit gap-0"
      >
        <TabsList className="inline-flex w-fit flex-wrap justify-start gap-0.5 rounded-[6px] bg-soil/10 p-[3px] group-data-horizontal/tabs:h-auto">
          {TABLE_STATES.map((s) => (
            <TabsTrigger
              key={s.key}
              value={s.key}
              className="h-auto flex-none cursor-pointer whitespace-nowrap rounded-[5px] border-0 px-[11px] py-1 text-[12px] font-semibold leading-[1.5] text-soil shadow-none transition-none hover:text-soil data-active:bg-paper data-active:text-console data-active:shadow-none group-data-[variant=default]/tabs-list:data-active:shadow-none"
            >
              {s.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {showFilterBar ? (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <div className="flex h-8 w-full items-center gap-[7px] rounded-[6px] border border-soil/25 bg-paper px-2.5 sm:w-60">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="flex-none">
              <circle cx="7" cy="7" r="5" stroke="#9ba6b3" strokeWidth="1.5" />
              <path d="M11 11l3.2 3.2" stroke="#9ba6b3" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reference or supplier…"
              aria-label="Search reference or supplier"
              className="h-auto w-full min-w-0 rounded-none border-0 bg-transparent p-0 text-[13px] text-soil shadow-none outline-none placeholder:text-soil/70 focus-visible:ring-0 md:text-[13px] dark:bg-transparent"
            />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger aria-label="Status" className={filterSelectClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY}>Status</SelectItem>
              {(["Recorded", "In transit", "Received", "Voided"] as const).map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={commodity} onValueChange={setCommodity}>
            <SelectTrigger aria-label="Commodity" className={filterSelectClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY}>Commodity</SelectItem>
              {purchaseCommodities.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={agent} onValueChange={setAgent}>
            <SelectTrigger aria-label="Agent" className={filterSelectClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY}>Agent</SelectItem>
              {purchaseAgents.map((a) => (
                <SelectItem key={a} value={a}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger aria-label="Date range" className={filterSelectClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["Date range", "Last 7 days", "Last 30 days", "Last 90 days"].map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {dateRange !== "Date range" ? (
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-[#E7EEE9] px-[11px] py-[5px] text-[12px] font-semibold text-console">
              {dateRange}
              <button
                type="button"
                aria-label="Clear date range"
                onClick={() => setDateRange("Date range")}
                className="cursor-pointer font-bold opacity-60"
              >
                ✕
              </button>
            </span>
          ) : null}
        </div>
      ) : null}

      {tableState === "loaded" && !filteredEmpty ? (
        <>
          {/* Desktop / tablet table */}
          <ConsoleDataTable<PurchaseRow>
            columns={columns}
            data={visible}
            itemNoun="purchases"
            globalFilter={search}
            rowHref={(p) => `/admin/purchases/${p.ref}`}
            rowClassName={() => "h-11 text-[13px] hover:bg-surface-alt/50"}
            className="hidden overflow-hidden rounded-[8px] border border-soil/25 bg-paper md:block"
          />

          {/* Mobile cards */}
          <div className="flex flex-col gap-2.5 md:hidden">
            {visible.map((p) => {
              const voided = p.status === "Voided";
              return (
                <Link
                  key={p.ref}
                  href={`/admin/purchases/${p.ref}`}
                  className="rounded-[8px] border border-soil/25 bg-paper px-3.5 py-[13px]"
                >
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <Mono className="text-[12.5px] font-semibold text-console">{p.ref}</Mono>
                    <StatusChip tone={p.tone}>{p.status}</StatusChip>
                  </div>
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="text-[14px] font-semibold text-ink">{p.supplier}</div>
                    <Mono
                      className={cn("text-[15px] font-bold", voided ? "text-soil/70 line-through" : "text-ink")}
                    >
                      {formatCedis(purchaseTotal(p))}
                    </Mono>
                  </div>
                  <div className="mt-[3px] text-[12.5px] text-soil">
                    {p.commodity} · {formatKg(p.weightKg)}
                  </div>
                  <div className="mt-0.5 text-[12px] text-soil/70">
                    {p.agent} · {p.date}
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      ) : null}

      {tableState === "loading" ? (
        <div className="overflow-hidden rounded-[8px] border border-soil/25 bg-paper">
          <div className="flex h-[38px] items-center gap-6 border-b border-soil/25 bg-surface-alt/70 px-4">
            {["w-12", "w-[70px]", "w-[130px]", "w-[90px]", "w-16"].map((w) => (
              <Shimmer key={w} className={cn("h-[9px]", w)} />
            ))}
          </div>
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="flex h-11 items-center gap-6 border-b border-soil/15 px-4">
              <Shimmer className="h-2.5 w-14" />
              <Shimmer className="h-2.5 w-[78px]" />
              <Shimmer className="h-2.5 max-w-[220px] flex-1" />
              <Shimmer className="ml-auto h-2.5 w-[70px]" />
              <Shimmer className="h-[18px] w-[84px] rounded-full" />
            </div>
          ))}
        </div>
      ) : null}

      {tableState === "empty" ? (
        <div className="rounded-[8px] border border-soil/25 bg-paper px-6 py-16 text-center">
          <svg width="72" height="60" viewBox="0 0 72 60" fill="none" aria-hidden="true" className="mx-auto mb-[18px]">
            <path
              d="M22 14 L50 14 L54 22 L54 50 Q54 54 50 54 L22 54 Q18 54 18 50 L18 22 Z"
              stroke="#D6DBE2"
              strokeWidth="1.6"
            />
            <path d="M18 22 L54 22" stroke="#D6DBE2" strokeWidth="1.6" />
            <path d="M28 14 Q28 8 36 8 Q44 8 44 14" stroke="#D6DBE2" strokeWidth="1.6" />
            <path d="M28 33 Q36 40 44 33" stroke="#B9C1CB" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <div className="mb-[5px] text-[15.5px] font-bold text-ink">No purchases yet</div>
          <div className="mx-auto mb-[18px] max-w-[340px] text-[13.5px] text-soil">
            Record your first purchase to see stock and agent floats come alive here.
          </div>
          <AdminButton onClick={() => router.push("/admin/purchases/new")}>+ Record purchase</AdminButton>
        </div>
      ) : null}

      {tableState !== "empty" && tableState !== "loading" && tableState !== "error" && filteredEmpty ? (
        <div className="rounded-[8px] border border-soil/25 bg-paper px-6 py-[52px] text-center">
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none" aria-hidden="true" className="mx-auto mb-3.5">
            <circle cx="25" cy="25" r="13" stroke="#D6DBE2" strokeWidth="1.6" />
            <path d="M35 35 L46 46" stroke="#D6DBE2" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M20 25 L30 25" stroke="#B9C1CB" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <div className="mb-[5px] text-[15px] font-bold text-ink">No purchases match these filters</div>
          <div className="mb-4 text-[13.5px] text-soil">Try widening the date range or clearing a filter.</div>
          <AdminButton variant="secondary" className="text-console" onClick={clearFilters}>
            Clear all filters
          </AdminButton>
        </div>
      ) : null}

      {tableState === "error" ? (
        <div className="rounded-[8px] border border-soil/25 bg-paper px-6 py-[52px] text-center">
          <div className="mx-auto mb-3.5 flex h-11 w-11 items-center justify-center rounded-full bg-[#F8E9E7] text-[20px] font-bold text-console-red">
            !
          </div>
          <div className="mb-[5px] text-[15px] font-bold text-ink">Couldn&apos;t load purchases</div>
          <div className="mb-1 text-[13.5px] text-soil">Check your connection and retry — nothing was lost.</div>
          <Mono className="mb-4 block text-[11.5px] text-soil/70">Ref: ERR-2481-P</Mono>
          <AdminButton onClick={() => setTableState("loaded")}>Retry</AdminButton>
        </div>
      ) : null}

      <VoidPurchaseDialog
        purchase={voidTarget}
        onOpenChange={(open) => {
          if (!open) setVoidTarget(null);
        }}
        onConfirm={confirmVoid}
      />
    </div>
  );
}
