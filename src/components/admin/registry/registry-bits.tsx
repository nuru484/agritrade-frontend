import { cn } from "@/lib/utils";
import { ToneBadge } from "@/components/admin/ui";
import { PurchaseSource } from "@/types/registry.types";

/**
 * Shared bits for the live registry screens (commodities, warehouses,
 * suppliers, buyers, expense categories) - the same idiom the Users register
 * established.
 */

export const SOURCE_LABEL: Record<PurchaseSource, string> = {
  [PurchaseSource.INDIVIDUAL]: "Individual",
  [PurchaseSource.COMPANY]: "Company",
  [PurchaseSource.AGENT]: "Agent",
};

export function ActiveBadge({ isActive }: { isActive: boolean }) {
  return isActive ? (
    <ToneBadge tone="leaf">Active</ToneBadge>
  ) : (
    <ToneBadge tone="slate">Inactive</ToneBadge>
  );
}

export function PublishedBadge({ published }: { published: boolean }) {
  return published ? (
    <ToneBadge tone="harvest">On website</ToneBadge>
  ) : (
    <ToneBadge tone="slate">Not published</ToneBadge>
  );
}

/** Column meta shared by every register table (users-table convention). */
export const columnMeta = (opts?: { wide?: boolean; className?: string }) => ({
  className: cn(
    "px-4 py-0 text-[13px]",
    opts?.wide ? "hidden xl:table-cell" : "table-cell",
    opts?.className,
  ),
  headerClassName:
    "h-[38px] whitespace-nowrap bg-surface-alt/70 py-0 text-[10.5px] font-bold uppercase tracking-[0.09em] text-soil",
});

export const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
] as const;

export type StatusFilter = (typeof STATUS_FILTER_OPTIONS)[number]["value"];

/** Maps the status facet onto the backend's isActive filter. */
export const statusToQuery = (
  status: StatusFilter,
): { isActive?: boolean } => {
  if (status === "active") return { isActive: true };
  if (status === "inactive") return { isActive: false };
  return {};
};

/** "—" placeholder the console uses for absent optional values. */
export function Absent() {
  return <span className="text-soil/45">—</span>;
}
