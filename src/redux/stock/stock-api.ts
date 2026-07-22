import { apiSlice } from "../api-slice";
import { toQueryString } from "@/lib/to-query-string";
import type { IApprovalResponse } from "@/types/approval.types";
import type {
  IRequestAdjustmentInput,
  IStockBalancesQuery,
  IStockBalancesResponse,
  IStockMovementsQuery,
  IStockMovementsResponse,
} from "@/types/stock.types";

/** The stock ledger, mirroring the backend `/admin/stock` surface. */
export const stockApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getStockBalances: builder.query<
      IStockBalancesResponse,
      IStockBalancesQuery | void
    >({
      query: (params) => `admin/stock/balances${toQueryString(params ?? {})}`,
      providesTags: [{ type: "Stock", id: "LIST" }],
    }),

    getStockMovements: builder.query<
      IStockMovementsResponse,
      IStockMovementsQuery | void
    >({
      query: (params) => `admin/stock/movements${toQueryString(params ?? {})}`,
      providesTags: [{ type: "StockMovements", id: "LIST" }],
    }),

    requestStockAdjustment: builder.mutation<
      IApprovalResponse,
      IRequestAdjustmentInput
    >({
      query: (body) => ({
        url: "admin/stock/adjustments",
        method: "POST",
        body,
      }),
      // The adjustment is a proposal - nothing moves until the approval is
      // decided, so only the approvals surfaces refresh here.
      invalidatesTags: [
        { type: "Approvals", id: "LIST" },
        { type: "ApprovalsCount", id: "COUNT" },
      ],
    }),
  }),
});

export const {
  useGetStockBalancesQuery,
  useGetStockMovementsQuery,
  useRequestStockAdjustmentMutation,
} = stockApi;
