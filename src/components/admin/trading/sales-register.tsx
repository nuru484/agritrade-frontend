"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { AdminButton, Mono } from "@/components/admin/ui";
import { ConsoleDataTable } from "@/components/admin/data-table";
import { notify } from "@/lib/notify";
import { cn } from "@/lib/utils";
import { formatCedis } from "@/lib/format-money";
import { saleRows, type SaleRow } from "@/static-data/admin/trading";
import { RowIconButton, StatusChip } from "./bits";

/** Console register header cell — pinned over the data table's defaults. */
const headClass = "h-[38px] bg-surface-alt/70 py-0 text-[10.5px] font-bold tracking-[0.09em] text-soil";

export function SalesRegister() {
  const router = useRouter();

  const columns = useMemo<ColumnDef<SaleRow, unknown>[]>(
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
        accessorKey: "buyer",
        header: "Buyer",
        enableSorting: false,
        meta: { className: "px-1.5 py-0 text-[13px] text-ink", headerClassName: headClass },
        cell: ({ row }) => <span className="block truncate">{row.original.buyer}</span>,
      },
      {
        accessorKey: "goods",
        header: "Goods",
        enableSorting: false,
        meta: {
          className: "hidden px-1.5 py-0 text-[13px] text-soil xl:table-cell",
          headerClassName: headClass,
        },
        cell: ({ row }) => <span className="block truncate">{row.original.goods}</span>,
      },
      {
        accessorKey: "agreedCedis",
        header: "Agreed",
        enableSorting: false,
        meta: {
          className: "w-[110px] px-1.5 py-0 text-right text-[13px] xl:w-[108px]",
          headerClassName: headClass,
        },
        cell: ({ row }) => (
          <Mono className="whitespace-nowrap text-ink">{formatCedis(row.original.agreedCedis)}</Mono>
        ),
      },
      {
        accessorKey: "paidCedis",
        header: "Paid",
        enableSorting: false,
        meta: {
          className: "hidden w-[104px] px-1.5 py-0 text-right text-[13px] xl:table-cell",
          headerClassName: headClass,
        },
        cell: ({ row }) => (
          <Mono className="whitespace-nowrap text-soil">{formatCedis(row.original.paidCedis)}</Mono>
        ),
      },
      {
        id: "balance",
        header: "Balance",
        enableSorting: false,
        accessorFn: (row) => row.agreedCedis - row.paidCedis,
        meta: {
          className: "w-[110px] px-1.5 py-0 text-right text-[13px] xl:w-[108px]",
          headerClassName: headClass,
        },
        cell: ({ row }) => {
          const balance = row.original.agreedCedis - row.original.paidCedis;
          return (
            <Mono
              className={cn(
                "whitespace-nowrap font-semibold",
                balance === 0 ? "text-[#2F5E3D]" : "text-console-red",
              )}
            >
              {balance === 0 ? "Paid in full" : formatCedis(balance)}
            </Mono>
          );
        },
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
          className: "hidden py-0 pl-1.5 pr-4 text-right text-[13px] xl:w-[106px] xl:table-cell",
          headerClassName: headClass,
        },
        cell: ({ row }) => {
          const s = row.original;
          return (
            <span className="flex justify-end gap-[3px]">
              <RowIconButton
                title="Record payment"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/admin/sales/${s.ref}?pay=1`);
                }}
              >
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <rect x="1.5" y="4" width="13" height="8.5" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                  <circle cx="8" cy="8.2" r="2" stroke="currentColor" strokeWidth="1.4" />
                </svg>
              </RowIconButton>
              <RowIconButton
                title="Send payment link"
                onClick={(e) => {
                  e.stopPropagation();
                  notify.info(`Payment link sent to ${s.buyer} — expires in 48h`);
                }}
              >
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path
                    d="M6.5 9.5 9.5 6.5M5 11l-1.2 1.2a2.5 2.5 0 0 1-3.5-3.5L2.5 6.5M11 5l1.2-1.2a2.5 2.5 0 0 1 3.5 3.5L13.5 9.5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    transform="translate(-0.5 0.5)"
                  />
                </svg>
              </RowIconButton>
              <RowIconButton
                title="Cancel sale"
                danger
                onClick={(e) => {
                  e.stopPropagation();
                  notify.info(`Cancellation of ${s.ref} sent for owner approval`);
                }}
              >
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M3.8 3.8 12.2 12.2" stroke="currentColor" strokeWidth="1.4" />
                </svg>
              </RowIconButton>
            </span>
          );
        },
      },
    ],
    [router],
  );

  return (
    <div>
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold tracking-[-0.01em] text-ink">Sales</h1>
          <div className="mt-0.5 text-[13px] text-soil">Agreements with buyers, payments and fulfilment</div>
        </div>
        <AdminButton className="h-[34px] whitespace-nowrap">+ New sale</AdminButton>
      </div>

      {/* Desktop / tablet table */}
      <ConsoleDataTable<SaleRow>
        columns={columns}
        data={saleRows}
        itemNoun="sales"
        rowHref={(s) => `/admin/sales/${s.ref}`}
        rowClassName={() => "h-11 text-[13px] hover:bg-surface-alt/50"}
        className="hidden overflow-hidden rounded-[8px] border border-soil/25 bg-paper md:block"
      />

      {/* Mobile cards */}
      <div className="flex flex-col gap-2.5 md:hidden">
        {saleRows.map((s) => {
          const balance = s.agreedCedis - s.paidCedis;
          return (
            <Link key={s.ref} href={`/admin/sales/${s.ref}`} className="rounded-[8px] border border-soil/25 bg-paper px-3.5 py-[13px]">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <Mono className="text-[12.5px] font-semibold text-console">{s.ref}</Mono>
                <StatusChip tone={s.tone}>{s.status}</StatusChip>
              </div>
              <div className="text-[14px] font-semibold text-ink">{s.buyer}</div>
              <div className="mt-0.5 text-[12.5px] text-soil">{s.goods}</div>
              <div className="mt-1.5 flex justify-between">
                <span className="text-[12px] text-soil">Balance</span>
                <Mono
                  className={cn("text-[14px] font-bold", balance === 0 ? "text-[#2F5E3D]" : "text-console-red")}
                >
                  {balance === 0 ? "Paid in full" : formatCedis(balance)}
                </Mono>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
