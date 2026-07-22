import { apiSlice } from "../api-slice";
import { toQueryString } from "@/lib/to-query-string";
import type {
  IBuyer,
  IBuyerResponse,
  ICreateBuyerInput,
  IRegistryListQuery,
  IRegistryListResponse,
  IUpdateBuyerInput,
} from "@/types/registry.types";
import type { IMessageResponse } from "@/types/auth.types";

/** The buyer directory, mirroring the backend `/admin/buyers` surface. */
export const buyersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBuyers: builder.query<
      IRegistryListResponse<IBuyer>,
      IRegistryListQuery | void
    >({
      query: (params) => `admin/buyers${toQueryString(params ?? {})}`,
      providesTags: (result) =>
        result
          ? [
              { type: "Buyers" as const, id: "LIST" },
              ...result.data.map((b) => ({ type: "Buyers" as const, id: b.id })),
            ]
          : [{ type: "Buyers" as const, id: "LIST" }],
    }),

    getBuyer: builder.query<IBuyerResponse, string>({
      query: (id) => `admin/buyers/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Buyers", id }],
    }),

    createBuyer: builder.mutation<IBuyerResponse, ICreateBuyerInput>({
      query: (body) => ({ url: "admin/buyers", method: "POST", body }),
      invalidatesTags: [{ type: "Buyers", id: "LIST" }],
    }),

    updateBuyer: builder.mutation<
      IBuyerResponse,
      { id: string; body: IUpdateBuyerInput }
    >({
      query: ({ id, body }) => ({
        url: `admin/buyers/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Buyers", id },
        { type: "Buyers", id: "LIST" },
      ],
    }),

    deactivateBuyer: builder.mutation<IBuyerResponse, string>({
      query: (id) => ({ url: `admin/buyers/${id}/deactivate`, method: "PATCH" }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Buyers", id },
        { type: "Buyers", id: "LIST" },
      ],
    }),

    activateBuyer: builder.mutation<IBuyerResponse, string>({
      query: (id) => ({ url: `admin/buyers/${id}/activate`, method: "PATCH" }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Buyers", id },
        { type: "Buyers", id: "LIST" },
      ],
    }),

    deleteBuyer: builder.mutation<IMessageResponse, string>({
      query: (id) => ({ url: `admin/buyers/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Buyers", id: "LIST" }],
    }),
  }),
});

export const {
  useGetBuyersQuery,
  useGetBuyerQuery,
  useCreateBuyerMutation,
  useUpdateBuyerMutation,
  useDeactivateBuyerMutation,
  useActivateBuyerMutation,
  useDeleteBuyerMutation,
} = buyersApi;
