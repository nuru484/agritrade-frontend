import { z } from "zod";

/**
 * Mirrors the backend `decideApprovalSchema`
 * (agritrade-backend src/validations/approval-validation.ts). The note is
 * optional on approval; rejection REQUIRES it - the service enforces the
 * same rule, this just surfaces it before the round trip.
 */
export const approveFormSchema = z.object({
  note: z
    .string()
    .trim()
    .max(500, "Keep the note under 500 characters")
    .refine((v) => v.length === 0 || v.length >= 3, {
      message: "A note needs at least 3 characters",
    }),
});

export const rejectFormSchema = z.object({
  note: z
    .string()
    .trim()
    .min(3, "Say why this is rejected - the requester needs the context")
    .max(500, "Keep the note under 500 characters"),
});

export type ApproveFormValues = z.infer<typeof approveFormSchema>;
export type RejectFormValues = z.infer<typeof rejectFormSchema>;
