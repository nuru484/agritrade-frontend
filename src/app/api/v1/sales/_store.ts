/**
 * The stand-in sales ledger for the /pay flow, until the real backend ships.
 * Demo references (from the design's prototype):
 *   DB-1042 — GH₵ 12,500.00 outstanding (payable)
 *   DB-1017 — fully settled
 * Anything else is not on record (404).
 */
import type { ISale } from "@/types/sale.types";

const SELLER = "DB Plus Trading Ltd";

export const DEMO_SALES: Record<string, ISale> = {
  "DB-1042": {
    reference: "DB-1042",
    seller: SELLER,
    status: "OUTSTANDING",
    amountOutstanding: 1_250_000,
    currency: "GHS",
  },
  "DB-1017": {
    reference: "DB-1017",
    seller: SELLER,
    status: "SETTLED",
    amountOutstanding: 0,
    currency: "GHS",
  },
};

export const findSale = (reference: string): ISale | undefined =>
  DEMO_SALES[reference.trim().toUpperCase()];
