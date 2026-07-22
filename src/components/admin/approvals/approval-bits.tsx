import { ToneBadge, type Tone } from "@/components/admin/ui";
import { formatCedis } from "@/lib/format-money";
import { ApprovalAction, ApprovalStatus } from "@/types/approval.types";

/** Shared bits for the approvals inbox - action/status tones and the
 * defensive summary renderer (summary shapes vary by action). */

export const ACTION_LABEL: Record<ApprovalAction, string> = {
  [ApprovalAction.PURCHASE_ABOVE_THRESHOLD]: "Purchase above threshold",
  [ApprovalAction.STOCK_ADJUSTMENT]: "Stock adjustment",
  [ApprovalAction.PUBLISH_TO_WEBSITE]: "Publish to website",
};

export const ACTION_TONE: Record<ApprovalAction, Tone> = {
  [ApprovalAction.PURCHASE_ABOVE_THRESHOLD]: "harvest",
  [ApprovalAction.STOCK_ADJUSTMENT]: "sky",
  [ApprovalAction.PUBLISH_TO_WEBSITE]: "leaf",
};

export const APPROVAL_STATUS_LABEL: Record<ApprovalStatus, string> = {
  [ApprovalStatus.PENDING]: "Pending",
  [ApprovalStatus.APPROVED]: "Approved",
  [ApprovalStatus.REJECTED]: "Rejected",
};

export const APPROVAL_STATUS_TONE: Record<ApprovalStatus, Tone> = {
  [ApprovalStatus.PENDING]: "harvest",
  [ApprovalStatus.APPROVED]: "leaf",
  [ApprovalStatus.REJECTED]: "slate",
};

export function ActionBadge({ action }: { action: ApprovalAction }) {
  return <ToneBadge tone={ACTION_TONE[action]}>{ACTION_LABEL[action]}</ToneBadge>;
}

export function ApprovalStatusBadge({ status }: { status: ApprovalStatus }) {
  return (
    <ToneBadge tone={APPROVAL_STATUS_TONE[status]}>
      {APPROVAL_STATUS_LABEL[status]}
    </ToneBadge>
  );
}

const asRecord = (value: unknown): Record<string, unknown> =>
  typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : {};

const str = (v: unknown): string | null => (typeof v === "string" ? v : null);
const num = (v: unknown): number | null =>
  typeof v === "number" && Number.isFinite(v) ? v : null;

/**
 * Renders the request's display snapshot human-first. Shapes by action:
 * purchases carry { totalGhs, commodityName, source }; stock adjustments
 * { commodityName, warehouseName, deltaKg, reason }. Anything missing
 * degrades to whatever fields exist - never a crash on an old snapshot.
 */
export function summaryLine(
  action: ApprovalAction,
  summary: unknown,
): { headline: string; detail: string | null } {
  const s = asRecord(summary);
  if (action === ApprovalAction.PURCHASE_ABOVE_THRESHOLD) {
    const total = num(s.totalGhs);
    const commodity = str(s.commodityName);
    const source = str(s.source);
    return {
      headline: total !== null ? formatCedis(total) : "Purchase",
      detail: [
        commodity ? `${commodity} purchase` : null,
        source ? `${source.toLowerCase()}-sourced` : null,
      ]
        .filter(Boolean)
        .join(", ") || null,
    };
  }
  if (action === ApprovalAction.STOCK_ADJUSTMENT) {
    const delta = num(s.deltaKg);
    const commodity = str(s.commodityName);
    const warehouse = str(s.warehouseName);
    const signed =
      delta !== null
        ? `${delta > 0 ? "+" : ""}${delta.toLocaleString("en-GH")} kg`
        : "Adjustment";
    return {
      headline: [signed, commodity].filter(Boolean).join(" "),
      detail:
        [warehouse ? `at ${warehouse}` : null, str(s.reason)]
          .filter(Boolean)
          .join(" - ") || null,
    };
  }
  return {
    headline: str(s.commodityName) ?? "Publish to website",
    detail: str(s.reason),
  };
}
