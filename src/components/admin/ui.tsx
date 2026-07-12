import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * Console primitives: shadcn components re-skinned to the DB Plus Console
 * system (Meridian slate + forest/gold/red accents, mono numerals). The
 * shadcn pieces provide behavior and a11y; the classes here pin the exact
 * console look — screens compose these, never restyle shadcn directly.
 */

/** The design's six status tones — used by chips, dots and timeline marks. */
export const TONES = {
  sky: { fg: "#33587A", bg: "#E8EFF4", dot: "#3E6B8C" },
  leaf: { fg: "#2F5E3D", bg: "#E6F0E9", dot: "#3E7A50" },
  harvest: { fg: "#7A5407", bg: "#F7EED8", dot: "#B8860B" },
  alert: { fg: "#8E2E24", bg: "#F8E9E7", dot: "#B03A2E" },
  slate: { fg: "#4c5765", bg: "#eceff3", dot: "#9ba6b3" },
  forest: { fg: "#1E3D2B", bg: "#E7EEE9", dot: "#1E3D2B" },
} as const;

export type Tone = keyof typeof TONES;

/** Status chip: shadcn Badge worn as the console's tinted tone pill. */
export function ToneBadge({
  tone,
  children,
  className,
}: {
  tone: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  const t = TONES[tone];
  return (
    <Badge
      className={cn(
        "gap-1.5 rounded-full border-transparent px-2 py-0.5 text-[11.5px] font-semibold whitespace-nowrap",
        className,
      )}
      style={{ color: t.fg, background: t.bg }}
    >
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 flex-none rounded-full"
        style={{ background: t.dot }}
      />
      {children}
    </Badge>
  );
}

/** White console card — shadcn Card as a bare container (screens own padding). */
export function AdminCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Card
      className={cn(
        "block gap-0 rounded-[10px] border-slate-200 bg-white py-0 shadow-none",
        className,
      )}
    >
      {children}
    </Card>
  );
}

/** Page header: title + sub left, actions right. */
export function AdminPageHeader({
  title,
  sub,
  actions,
  className,
}: {
  title: string;
  sub?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-4 flex flex-wrap items-end justify-between gap-x-6 gap-y-3",
        className,
      )}
    >
      <div className="min-w-0 max-w-full">
        <h1
          title={title}
          className="truncate text-[19px] font-bold text-slate-900"
        >
          {title}
        </h1>
        {sub ? (
          <p className="mt-0.5 truncate text-[13px] text-slate-500" title={sub}>
            {sub}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

/** Tabular mono numeral (money, weights, refs). */
export function Mono({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span className={cn("font-adminmono tabular-nums", className)}>
      {children}
    </span>
  );
}

/** Console buttons: shadcn Button pinned to the console sizes/colours.
 * primary forest · secondary bordered white · outline bordered transparent
 * (Cancel and friends) · danger red · gold warn · ghost. */
export function AdminButton({
  variant = "primary",
  className,
  ...props
}: Omit<React.ComponentProps<typeof Button>, "variant"> & {
  variant?: "danger" | "ghost" | "gold" | "outline" | "primary" | "secondary";
}) {
  return (
    <Button
      type="button"
      variant={
        variant === "secondary" || variant === "outline"
          ? "outline"
          : variant === "ghost"
            ? "ghost"
            : "default"
      }
      className={cn(
        "h-9 gap-1.5 rounded-[6px] px-4 text-[13.5px] font-semibold shadow-none",
        variant === "primary" && "bg-console text-white hover:bg-console-deep",
        variant === "secondary" &&
          "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-700",
        // Bordered but quiet: transparent until hovered — the Cancel shape.
        variant === "outline" &&
          "border-slate-300 bg-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-700",
        variant === "danger" && "bg-console-red text-white hover:bg-console-red-deep",
        variant === "gold" && "bg-console-gold text-white hover:bg-console-gold-deep",
        variant === "ghost" && "text-slate-600 hover:bg-slate-100 hover:text-slate-700",
        className,
      )}
      {...props}
    />
  );
}

/** Field label + control wrapper for console forms (shadcn Label inside). */
export function AdminField({
  label,
  hint,
  error,
  optional,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Label className="block font-normal leading-normal">
      <span className="mb-[5px] block text-[13px] font-semibold text-slate-700">
        {label}
        {optional ? (
          <span className="font-normal text-slate-400"> (optional)</span>
        ) : null}
      </span>
      {children}
      {error ? (
        <span role="alert" className="mt-1 block text-[12.5px] font-medium text-console-red">
          {error}
        </span>
      ) : hint ? (
        <span className="mt-1 block text-[12.5px] font-normal text-slate-500">{hint}</span>
      ) : null}
    </Label>
  );
}

/** Console control skin — layer onto shadcn Input/native selects so every
 * field matches the 38px slate box with the forest focus ring. */
export const adminInputClass =
  "h-[38px] w-full rounded-[6px] border border-slate-300 bg-white px-2.5 text-[14px] font-normal text-slate-900 shadow-none outline-none placeholder:text-slate-300 focus:border-console focus:shadow-[0_0_0_3px_rgb(30_61_43/0.15)] focus-visible:border-console focus-visible:ring-0";

export const adminSelectClass = cn(adminInputClass, "cursor-pointer");
