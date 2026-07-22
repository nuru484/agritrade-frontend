import { apiSlice } from "../api-slice";
import { toQueryString } from "@/lib/to-query-string";
import type {
  ICommodity,
  ICommodityListQuery,
  ICommodityResponse,
  ICreateCommodityInput,
  IRegistryListResponse,
  IUpdateCommodityInput,
} from "@/types/registry.types";
import type { IMessageResponse } from "@/types/auth.types";

/** Builds the request body: multipart when a photo travels with the save
 * (payload JSON + file - the backend uploads to Cloudinary in-request),
 * plain JSON otherwise. */
const withOptionalPhoto = (body: object, photo?: File) => {
  if (!photo) return body;
  const form = new FormData();
  form.append("payload", JSON.stringify(body));
  form.append("photo", photo);
  return form;
};

/** The commodity register, mirroring the backend `/admin/commodities` surface. */
export const commoditiesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCommodities: builder.query<
      IRegistryListResponse<ICommodity>,
      ICommodityListQuery | void
    >({
      query: (params) => `admin/commodities${toQueryString(params ?? {})}`,
      providesTags: (result) =>
        result
          ? [
              { type: "Commodities" as const, id: "LIST" },
              ...result.data.map((c) => ({
                type: "Commodities" as const,
                id: c.id,
              })),
            ]
          : [{ type: "Commodities" as const, id: "LIST" }],
    }),

    getCommodity: builder.query<ICommodityResponse, string>({
      query: (id) => `admin/commodities/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Commodities", id }],
    }),

    createCommodity: builder.mutation<
      ICommodityResponse,
      { body: ICreateCommodityInput; photo?: File }
    >({
      query: ({ body, photo }) => ({
        url: "admin/commodities",
        method: "POST",
        body: withOptionalPhoto(body, photo),
      }),
      invalidatesTags: [{ type: "Commodities", id: "LIST" }],
    }),

    updateCommodity: builder.mutation<
      ICommodityResponse,
      { id: string; body: IUpdateCommodityInput; photo?: File }
    >({
      query: ({ id, body, photo }) => ({
        url: `admin/commodities/${id}`,
        method: "PATCH",
        body: withOptionalPhoto(body, photo),
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Commodities", id },
        { type: "Commodities", id: "LIST" },
      ],
    }),

    publishCommodity: builder.mutation<
      ICommodityResponse,
      { id: string; publishToWebsite: boolean }
    >({
      query: ({ id, publishToWebsite }) => ({
        url: `admin/commodities/${id}/publish`,
        method: "PATCH",
        body: { publishToWebsite },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Commodities", id },
        { type: "Commodities", id: "LIST" },
      ],
    }),

    deactivateCommodity: builder.mutation<ICommodityResponse, string>({
      query: (id) => ({
        url: `admin/commodities/${id}/deactivate`,
        method: "PATCH",
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Commodities", id },
        { type: "Commodities", id: "LIST" },
      ],
    }),

    activateCommodity: builder.mutation<ICommodityResponse, string>({
      query: (id) => ({
        url: `admin/commodities/${id}/activate`,
        method: "PATCH",
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Commodities", id },
        { type: "Commodities", id: "LIST" },
      ],
    }),

    deleteCommodity: builder.mutation<IMessageResponse, string>({
      query: (id) => ({ url: `admin/commodities/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Commodities", id: "LIST" }],
    }),
  }),
});

export const {
  useGetCommoditiesQuery,
  useGetCommodityQuery,
  useCreateCommodityMutation,
  useUpdateCommodityMutation,
  usePublishCommodityMutation,
  useDeactivateCommodityMutation,
  useActivateCommodityMutation,
  useDeleteCommodityMutation,
} = commoditiesApi;
