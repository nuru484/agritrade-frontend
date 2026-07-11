/**
 * The stand-in sales ledger for the /pay flow, until the real backend ships.
 * Demo references (from the design's prototype):
 *   NA-1042 — GH₵ 12,500.00 outstanding (payable)
 *   NA-1017 — fully settled
 * Anything else is not on record (404).
 */
import type { ISale } from "@/types/sale.types";

const SELLER = "Nasara Agro Trading Ltd";

export const DEMO_SALES: Record<string, ISale> = {
  "NA-1042": {
    reference: "NA-1042",
    seller: SELLER,
    status: "OUTSTANDING",
    amountOutstanding: 1_250_000,
    currency: "GHS",
  },
  "NA-1017": {
    reference: "NA-1017",
    seller: SELLER,
    status: "SETTLED",
    amountOutstanding: 0,
    currency: "GHS",
  },
};

export const findSale = (reference: string): ISale | undefined =>
  DEMO_SALES[reference.trim().toUpperCase()];
