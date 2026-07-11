/**
 * Sales lookup + payment — mirrors the `/api/v1/sales/:reference` contract
 * (the stand-in route handlers speak the same shape the real API will).
 */
export type SaleStatus = "OUTSTANDING" | "SETTLED";

export interface ISale {
  reference: string;
  seller: string;
  status: SaleStatus;
  /** Minor units (pesewas); 0 when the sale is settled. */
  amountOutstanding: number;
  currency: string;
}

/** `GET /sales/:reference` — 404 when the reference isn't on record. */
export interface ISaleResponse {
  message: string;
  data: ISale;
}

/** `POST /sales/:reference/pay` — in production this returns the Hubtel
 * checkout hand-off; the stub settles immediately. */
export interface IPaySaleResponse {
  message: string;
  data: {
    reference: string;
    amountPaid: number;
    currency: string;
    /** Present when the payment continues on Hubtel. */
    authorizationUrl?: string;
  };
}
