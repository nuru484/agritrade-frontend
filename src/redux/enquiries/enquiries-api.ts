import { apiSlice } from "../api-slice";
import type { IEnquiryInput, IEnquiryResponse } from "@/types/enquiry.types";

/**
 * Contact enquiries — the public "send an enquiry" mutation. Queries that
 * list enquiries (the future admin console) will attach here too and share
 * the `Enquiries` tag for invalidation.
 */
export const enquiriesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createEnquiry: builder.mutation<IEnquiryResponse, IEnquiryInput>({
      query: (body) => ({ url: "enquiries", method: "POST", body }),
      invalidatesTags: ["Enquiries"],
    }),
  }),
});

export const { useCreateEnquiryMutation } = enquiriesApi;
