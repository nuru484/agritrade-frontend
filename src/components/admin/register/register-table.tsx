"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { ConsoleDataTable } from "@/components/admin/data-table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AdminCard,
  Mono,
  ToneBadge,
  adminSelectClass,
} from "@/components/admin/ui";
import {
  avatarOf,
  cellText,
  isTagCell,
  type RegisterCell,
  type RegisterConfig,
  type RegisterHeader,
  type RegisterRow,
} from "@/static-data/admin/registers";

function BodyCell({
  cell,
  header,
  first,
  avatar,
}: {
  cell: RegisterCell;
  header: RegisterHeader;
  first: boolean;
  avatar: boolean;
}) {
  const text = cellText(cell);
  if (first && avatar) {
    const av = avatarOf(text);
    return (
      <span className="inline-flex max-w-full min-w-0 items-center gap-2">
        <span
          aria-hidden="true"
          className="font-adminmono inline-flex h-6 w-6 flex-none items-center justify-center rounded-full text-[10px] font-bold"
          style={{ background: av.bg, color: av.fg }}
        >
          {av.init}
        </span>
        <span className="truncate font-medium text-slate-900">{text}</span>
      </span>
    );
  }
  if (header.tag && isTagCell(cell)) {
    return <ToneBadge tone={cell.tone}>{cell.t}</ToneBadge>;
  }
  const styled = typeof cell === "object" && !isTagCell(cell) ? cell : undefined;
  const style = {
    color: styled?.c ?? (header.align === "right" ? "#161c24" : "#39424f"),
    fontWeight: styled?.w ?? 400,
  };
  return header.align === "right" ? (
    <Mono className="whitespace-nowrap">
      <span style={style}>{text}</span>
    </Mono>
  ) : (
    <span className="whitespace-nowrap" style={style}>
      {text}
    </span>
  );
}

/**
 * The one register/list template: search, visual filters, config-driven
 * ConsoleDataTable (TanStack + shadcn Table) with tone chips and mono money
 * columns, pagination footer, rows linking to their record detail.
 */
export function RegisterTable({
  slug,
  register,
}: {
  slug: string;
  register: RegisterConfig & { rows: RegisterRow[] };
}) {
  const [query, setQuery] = useState("");

  const columns = useMemo<ColumnDef<RegisterRow, unknown>[]>(() => {
    const hrefOf = (row: RegisterRow) =>
      `/admin/${slug}/${encodeURIComponent(cellText(row[0]))}`;
    return register.headers.map((h, i) => ({
      id: String(i),
      accessorFn: (row: RegisterRow) => cellText(row[i]),
      header: h.l,
      enableSorting: false,
      meta: {
        // Applied to both th and td — column alignment + responsive hiding.
        className: cn(
          "px-4 py-0 text-[13px]",
          h.align === "right" && "text-right",
          h.wide ? "hidden xl:table-cell" : "table-cell",
        ),
        headerClassName:
          "h-[38px] whitespace-nowrap bg-slate-50 py-0 text-[10.5px] font-bold uppercase tracking-[0.09em] text-slate-500",
      },
      cell: ({ row }) =>
        i === 0 ? (
          // The real link, for keyboard + middle-click.
          <Link
            href={hrefOf(row.original)}
            className="outline-none focus-visible:underline"
            onClick={(e) => e.stopPropagation()}
          >
            <BodyCell cell={row.original[i]} header={h} first avatar={!!register.avatar} />
          </Link>
        ) : (
          <BodyCell cell={row.original[i]} header={h} first={false} avatar={false} />
        ),
    }));
  }, [register, slug]);

  return (
    <div>
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold tracking-[-0.01em] text-slate-900">
            {register.title}
          </h1>
          <p className="mt-0.5 text-[13px] text-slate-500">{register.sub}</p>
        </div>
        {register.add ? (
          <Link
            href={`/admin/${slug}/new`}
            className="inline-flex h-[34px] items-center whitespace-nowrap rounded-[6px] bg-console px-4 text-[13.5px] font-semibold text-white transition-colors hover:bg-console-deep"
          >
            {register.add}
          </Link>
        ) : null}
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <label className="flex h-8 w-full max-w-[250px] items-center gap-1.5 rounded-[6px] border border-slate-200 bg-white px-2.5 focus-within:border-console">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="7" cy="7" r="5" stroke="#9ba6b3" strokeWidth="1.5" />
            <path d="M11 11l3.2 3.2" stroke="#9ba6b3" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={register.search}
            aria-label={register.search}
            className="h-full w-full min-w-0 rounded-none border-0 bg-transparent p-0 text-[13px] text-slate-900 outline-none placeholder:text-slate-300 focus-visible:ring-0 md:text-[13px]"
          />
        </label>
        {register.filters.map((filter) => (
          // Visual only until the backend supplies real facets.
          <Select key={filter} defaultValue={filter}>
            <SelectTrigger
              aria-label={`Filter by ${filter.toLowerCase()}`}
              className={cn(adminSelectClass, "h-8 w-auto text-[13px] text-slate-700")}
            >
              {/* Static children keep the label server-rendered (Radix only
                  mirrors item text after hydration). */}
              <SelectValue>{filter}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={filter}>{filter}</SelectItem>
            </SelectContent>
          </Select>
        ))}
      </div>

      <AdminCard className="overflow-hidden">
        <ConsoleDataTable<RegisterRow>
          columns={columns}
          data={register.rows}
          itemNoun="records"
          globalFilter={query}
          rowHref={(row) => `/admin/${slug}/${encodeURIComponent(cellText(row[0]))}`}
          rowClassName={() => "h-11 hover:bg-slate-50/70"}
          emptyState={
            <div className="px-6 py-14 text-center">
              <svg width="60" height="52" viewBox="0 0 72 60" fill="none" aria-hidden="true" className="mx-auto mb-3.5">
                <path d="M22 14 L50 14 L54 22 L54 50 Q54 54 50 54 L22 54 Q18 54 18 50 L18 22 Z" stroke="#D6DBE2" strokeWidth="1.6" fill="none" />
                <path d="M18 22 L54 22" stroke="#D6DBE2" strokeWidth="1.6" />
                <path d="M28 33 Q36 40 44 33" stroke="#B9C1CB" strokeWidth="1.6" strokeLinecap="round" fill="none" />
              </svg>
              <div className="mb-1 text-[15px] font-bold text-slate-800">
                {query ? "No matches" : "Nothing here yet"}
              </div>
              <p className="text-[13.5px] text-slate-500">
                {query
                  ? "Try a different search."
                  : `${register.add ? register.add.replace("+ ", "") : "Records"} will appear here once created.`}
              </p>
            </div>
          }
        />
      </AdminCard>
    </div>
  );
}
