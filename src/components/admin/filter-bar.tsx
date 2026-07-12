"use client";

import { useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

/**
 * The DB Plus toolbar field idiom: a micro uppercase label over a hairline
 * bottom rule — no boxes. The rule turns console-green while focused and
 * stays half-lit while the field holds a non-default value, so active
 * criteria read at a glance.
 */
const fieldLabel =
  "grid min-w-0 gap-1 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400";

const fieldRule = (active: boolean) =>
  cn(
    "flex h-8 w-full min-w-0 items-center gap-1.5 border-b bg-transparent px-0.5 transition-colors focus-within:border-console",
    active ? "border-console/60" : "border-slate-300",
  );

/** Labelled dropdown filter in the console skin. */
export function ConsoleLabeledSelect({
  label,
  value,
  onChange,
  options,
  active = false,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly { value: string; label: string }[];
  /** True when the value is non-default — keeps the rule half-lit. */
  active?: boolean;
  className?: string;
}) {
  return (
    <label className={cn(fieldLabel, className)}>
      {label}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          aria-label={`Filter by ${label.toLowerCase()}`}
          className={cn(
            "h-8 w-full cursor-pointer rounded-none border-0 border-b bg-transparent px-0.5 text-[13px] font-normal normal-case tracking-normal text-slate-700 shadow-none transition-colors focus:ring-0 focus-visible:ring-0 data-[state=open]:border-console",
            active ? "border-console/60" : "border-slate-300",
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
    <label className={cn(fieldLabel, className)}>
      {label}
      <span className="relative block min-w-0">
        <input
          type="date"
          value={value}
          min={min || undefined}
          max={max || undefined}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "peer h-8 w-full cursor-pointer appearance-none border-b bg-transparent px-0.5 text-[13px] font-normal normal-case tracking-normal outline-none transition-colors focus:border-console",
            value
              ? "border-console/60 text-slate-700"
              : "border-slate-300 text-transparent focus:text-slate-700",
          )}
        />
        {!value && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0.5 flex items-center text-[13px] font-normal normal-case tracking-normal text-slate-300 peer-focus:hidden"
          >
            {placeholder}
          </span>
        )}
      </span>
    </label>
  );
}

/**
 * The console list toolbar in the DB Plus field idiom — labelled underline
 * fields on the page ground, no boxed inputs.
 *
 * Desktop (md+): ONE ordered row — the search field, then the labelled
 * filters aligned to its baseline, Clear, and the persistent action pushed
 * to the right edge. Nothing wraps haphazardly; the row is the standard
 * admin-toolbar shape.
 *
 * Mobile: the search runs full width on its own line; a "Filters" toggle
 * with a mono active-count reveals the filters as an even two-column grid,
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
  /** Number of non-default filters, shown on the toggle. */
  activeCount?: number;
  /** Resets every filter (rendered only while any is active). */
  onClear?: () => void;
  /** Persistent action (e.g. "+ Add user"). */
  action?: ReactNode;
  /** ConsoleLabeledSelect / ConsoleDateField filters. */
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const searchField = (
    <label className={cn(fieldLabel, "w-full md:w-[240px] lg:w-[260px]")}>
      Search
      <span className={fieldRule(search.length > 0)}>
        <span
          aria-hidden="true"
          className="font-adminmono flex-none text-[13px] font-bold leading-none text-console/70"
        >
          »
        </span>
        <Input
          type="search"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          className="[&::-webkit-search-cancel-button]:hidden h-full w-full min-w-0 rounded-none border-0 bg-transparent p-0 text-[13px] font-normal normal-case tracking-normal text-slate-900 shadow-none outline-none placeholder:text-slate-300 focus-visible:ring-0 md:text-[13px]"
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
      </span>
    </label>
  );

  const clearButton =
    onClear && activeCount > 0 ? (
      <button
        type="button"
        onClick={onClear}
        className="cursor-pointer whitespace-nowrap text-[10.5px] font-bold uppercase tracking-[0.1em] text-console transition-colors hover:text-console-deep"
      >
        Clear filters
      </button>
    ) : null;

  return (
    <div className="mb-3">
      {/* ── Desktop: one ordered toolbar row ─────────────────────────────── */}
      <div className="hidden md:flex md:flex-wrap md:items-end md:gap-x-5 md:gap-y-2.5">
        {searchField}
        {children}
        {clearButton ? (
          <div className="md:flex md:h-8 md:items-center md:self-end">
            {clearButton}
          </div>
        ) : null}
        <div className="ml-auto md:self-end">{action}</div>
      </div>

      {/* ── Mobile: search line, then toggle + action, then the panel ────── */}
      <div className="md:hidden">
        {searchField}
        <div className="mt-3 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="console-filters"
            className={cn(
              "inline-flex h-8 cursor-pointer items-center gap-2 whitespace-nowrap border-b px-0.5 text-[10.5px] font-bold uppercase tracking-[0.1em] transition-colors",
              open
                ? "border-console text-console"
                : "border-slate-300 text-slate-500 hover:text-console",
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "h-1.5 w-1.5 flex-none rotate-45 transition-colors",
                activeCount > 0 || open ? "bg-console" : "bg-console/40",
              )}
            />
            Filters
            {activeCount > 0 ? (
              <span className="font-adminmono text-[11px] font-bold text-console">
                {String(activeCount).padStart(2, "0")}
              </span>
            ) : null}
          </button>
          {action}
        </div>
        <div
          id="console-filters"
          className={cn("mt-3 grid-cols-2 gap-x-4 gap-y-3", open ? "grid" : "hidden")}
        >
          {children}
          {clearButton ? <div className="col-span-2">{clearButton}</div> : null}
        </div>
      </div>
    </div>
  );
}
