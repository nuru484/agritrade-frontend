import { apiSlice } from "../api-slice";
import type {
  ISettingsResponse,
  IUpdateSettingsInput,
} from "@/types/settings.types";

/** Owner-editable system settings (`/admin/settings`, super-admin only). */
export const settingsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSettings: builder.query<ISettingsResponse, void>({
      query: () => "admin/settings",
      providesTags: [{ type: "Settings", id: "ALL" }],
    }),

    updateSettings: builder.mutation<ISettingsResponse, IUpdateSettingsInput>({
      query: (body) => ({ url: "admin/settings", method: "PATCH", body }),
      invalidatesTags: [{ type: "Settings", id: "ALL" }],
    }),
  }),
});

export const { useGetSettingsQuery, useUpdateSettingsMutation } = settingsApi;
