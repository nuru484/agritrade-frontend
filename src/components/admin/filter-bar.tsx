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
 * Labelled native date input for From/To windows in the toolbar.
 *
 * Date inputs ignore the `placeholder` attribute, and mobile browsers render
 * an empty one as a blank box (desktop Chrome at least shows mm/dd/yyyy).
 * So while empty and unfocused we hide the native text and overlay our own
 * placeholder; focus (or a picked value) hands the field back to the native
 * editor.
 */
export function ConsoleDateField({
  label,
  value,
  onChange,
  min,
  max,
  placeholder = "Any date",
  className,
}: {
  label: string;
  /** YYYY-MM-DD or "". */
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  placeholder?: string;
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
      <span className="relative block min-w-0">
        <input
          type="date"
          value={value}
          min={min || undefined}
          max={max || undefined}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "peer h-8 w-full cursor-pointer appearance-none rounded-[6px] border bg-white px-2 text-[13px] font-normal normal-case tracking-normal outline-none focus:border-console",
            value
              ? "border-console/50 text-slate-700"
              : "border-slate-200 text-transparent focus:text-slate-700",
          )}
        />
        {!value && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-2 flex items-center text-[13px] font-normal normal-case tracking-normal text-slate-300 peer-focus:hidden"
          >
            {placeholder}
          </span>
        )}
      </span>
    </label>
  );
}

/**
 * The console list toolbar (khadys-frontend's FilterBar pattern in the DB
 * Plus skin).
 *
 * Desktop (md+): ONE ordered row — the search field, then the labelled
 * filters aligned to its baseline, Clear filters, and the persistent action
 * pushed to the right edge. Nothing wraps haphazardly; the row is the
 * standard admin-toolbar shape.
 *
 * Mobile: the search runs full width on its own line; a "Filters" toggle
 * with an active-count pill reveals the filters as an even two-column grid,
 * with the action anchored beside the toggle.
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
    <label className="flex h-8 w-full min-w-0 items-center gap-1.5 rounded-[6px] border border-slate-200 bg-white px-2.5 focus-within:border-console md:w-[240px] md:flex-none lg:w-[260px]">
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
      {/* ── Desktop: one ordered toolbar row ─────────────────────────────── */}
      <div className="hidden md:flex md:flex-wrap md:items-end md:gap-2.5">
        <div className="md:self-end">{searchField}</div>
        {children}
        {clearButton ? <div className="md:self-center md:pt-4">{clearButton}</div> : null}
        <div className="ml-auto md:self-end">{action}</div>
      </div>

      {/* ── Mobile: search line, then toggle + action, then the panel ────── */}
      <div className="md:hidden">
        {searchField}
        <div className="mt-2 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="console-filters"
            className="inline-flex h-8 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-[6px] border border-slate-200 bg-white px-2.5 text-[12.5px] font-semibold text-slate-600 transition-colors hover:border-console hover:text-console"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
            Filters
            {activeCount > 0 ? (
              <span className="font-adminmono flex h-4 min-w-4 items-center justify-center rounded-full bg-console px-1 text-[10px] font-bold text-white">
                {activeCount}
              </span>
            ) : null}
          </button>
          {action}
        </div>
        <div
          id="console-filters"
          className={cn("mt-2 grid-cols-2 gap-2", open ? "grid" : "hidden")}
        >
          {children}
          {clearButton ? <div className="col-span-2">{clearButton}</div> : null}
        </div>
      </div>
    </div>
  );
}
