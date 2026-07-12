/**
 * The single tag registry for the RTK Query api-slice. Every feature file
 * pulls tag names from here so invalidation can never typo a tag.
 */
export const apiSliceTags = ["AuditLogs", "Enquiries", "Sales", "Users"] as const;

export type ApiSliceTag = (typeof apiSliceTags)[number];

/** Standard list metadata returned by every paginated endpoint. */
export interface IPaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
