import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { env } from "@/lib/env";
import { apiSliceTags } from "@/types/api";

/**
 * The one and only `createApi`. Feature endpoints attach via
 * `apiSlice.injectEndpoints` — never create a second slice — and the tag
 * registry lives in `types/api.ts` so invalidation stays typo-proof.
 *
 * With `SERVER_URI` unset the slice talks to this app's own `/api/v1/*`
 * route handlers; set it and every request moves to the real backend. When
 * an authenticated admin console arrives, the Mutex-guarded 401→refresh→retry
 * wrapper from khadys-kitchen/dms drops in around `baseQuery` here.
 */
export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    // `/api/v1` is appended here; SERVER_URI is just the origin (or empty).
    baseUrl: `${env.SERVER_URI}/api/v1`,
    credentials: "include",
  }),
  tagTypes: apiSliceTags,
  endpoints: () => ({}),
});
