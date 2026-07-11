import { apiSlice } from "../api-slice";
import type { IPaySaleResponse, ISaleResponse } from "@/types/sale.types";

/**
 * Sales — the /pay flow: look a sale up by its reference, then settle the
 * outstanding balance (Hubtel hand-off in production; the stand-in settles
 * immediately). Lookup is consumed lazily — the page fetches on "Find",
 * not on mount.
 */
export const salesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSale: builder.query<ISaleResponse, string>({
      query: (reference) => ({
        url: `sales/${encodeURIComponent(reference)}`,
        method: "GET",
      }),
      providesTags: (_r, _e, reference) => [{ type: "Sales", id: reference }],
    }),

    paySale: builder.mutation<IPaySaleResponse, string>({
      query: (reference) => ({
        url: `sales/${encodeURIComponent(reference)}/pay`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, reference) => [
        { type: "Sales", id: reference },
      ],
    }),
  }),
});

export const { useLazyGetSaleQuery, usePaySaleMutation } = salesApi;
