"use client";

import { useGetPendingApprovalsCountQuery } from "@/redux/approvals/approvals-api";

/**
 * The live pending-approvals count behind the sidebar and mobile-tab badges.
 * Polls every 60s so a request made on another device surfaces without a
 * reload; decisions in this tab invalidate the tag and refresh immediately.
 * Errors render as no badge (zero) - a broken badge must never block nav.
 */
export function usePendingApprovalsCount(): number {
  const { data } = useGetPendingApprovalsCountQuery(undefined, {
    pollingInterval: 60_000,
  });
  return data?.data.pending ?? 0;
}
