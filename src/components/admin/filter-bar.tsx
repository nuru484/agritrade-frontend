"use client";

import { useState, type ReactNode } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminSelectClass } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

/** Labelled dropdown filter in the console skin. */
export function ConsoleLabeledSelect({
  label,
  value,
  onChange,
  options,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly { value: string; label: string }[];
  className?: string;
}) {
  return (
    <label
      className={cn(
        "grid min-w-0 gap-1 text-[10.5px] font-bold uppercase tracking-[0.08em] text-slate-400",
        className,
      )}
    >
      {label}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          aria-label={`Filter by ${label.toLowerCase()}`}
          className={cn(
            adminSelectClass,
            "h-8 w-full text-[13px] font-normal normal-case tracking-normal text-slate-700",
          )}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value} className="cursor-pointer">
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}

/**
 * The console list toolbar (khadys-frontend's FilterBar pattern in the DB
 * Plus skin). Desktop: an inline row — search, filters, clear, action.
 * Mobile: the search stays full-width and the filters collapse behind a
 * "Filters" toggle with an active-count pill, so narrow screens (down to a
 * Galaxy Fold) get a tidy stack instead of a squeezed row.
 */
export function ConsoleFilterBar({
  search,
  onSearch,
  searchPlaceholder = "Search…",
  activeCount = 0,
  onClear,
  action,
  children,
}: {
  search: string;
  onSearch: (value: string) => void;
  searchPlaceholder?: string;
  /** Number of non-default filters, shown on the toggle pill. */
  activeCount?: number;
  /** Resets every filter (rendered only while any is active). */
  onClear?: () => void;
  /** Persistent action (e.g. "+ Add user"). */
  action?: ReactNode;
  /** ConsoleLabeledSelect filters. */
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const searchField = (
    <label className="flex h-8 w-full min-w-0 items-center gap-1.5 rounded-[6px] border border-slate-200 bg-white px-2.5 focus-within:border-console md:max-w-[260px]">
      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="flex-none">
        <circle cx="7" cy="7" r="5" stroke="#9ba6b3" strokeWidth="1.5" />
        <path d="M11 11l3.2 3.2" stroke="#9ba6b3" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <Input
        type="search"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder={searchPlaceholder}
        aria-label={searchPlaceholder}
        className="[&::-webkit-search-cancel-button]:hidden h-full w-full min-w-0 rounded-none border-0 bg-transparent p-0 text-[13px] text-slate-900 outline-none placeholder:text-slate-300 focus-visible:ring-0 md:text-[13px]"
      />
      {search ? (
        <button
          type="button"
          onClick={() => onSearch("")}
          aria-label="Clear search"
          className="flex h-4 w-4 flex-none cursor-pointer items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600"
        >
          <X className="h-3 w-3" aria-hidden="true" />
        </button>
      ) : null}
    </label>
  );

  const clearButton =
    onClear && activeCount > 0 ? (
      <button
        type="button"
        onClick={onClear}
        className="cursor-pointer whitespace-nowrap text-[12.5px] font-semibold text-console transition-colors hover:text-console-deep"
      >
        Clear filters
      </button>
    ) : null;

  return (
    <div className="mb-3">
      {/* Row 1: search + (mobile) filters toggle + action. Wraps cleanly at
          every width — nothing squeezes. */}
      <div className="flex flex-wrap items-center gap-2">
        {searchField}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="console-filters"
          className="inline-flex h-8 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-[6px] border border-slate-200 bg-white px-2.5 text-[12.5px] font-semibold text-slate-600 transition-colors hover:border-console hover:text-console md:hidden"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
          Filters
          {activeCount > 0 ? (
            <span className="font-adminmono flex h-4 min-w-4 items-center justify-center rounded-full bg-console px-1 text-[10px] font-bold text-white">
              {activeCount}
            </span>
          ) : null}
        </button>
        <div className="ml-auto flex items-center gap-2">
          <span className="hidden md:inline">{clearButton}</span>
          {action}
        </div>
      </div>

      {/* Row 2: the filters — hidden behind the toggle on mobile, always
          inline from md up. Two columns on phones so selects share the width
          evenly with no dead space. */}
      <div
        id="console-filters"
        className={cn(
          "mt-2 gap-2",
          open ? "grid grid-cols-2" : "hidden",
          "md:flex md:flex-wrap md:items-end",
        )}
      >
        {children}
        <div className={cn("col-span-2 md:hidden", !clearButton && "hidden")}>
          {clearButton}
        </div>
      </div>
    </div>
  );
}
