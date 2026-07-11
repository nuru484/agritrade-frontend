import { z } from "zod";
import { ENQUIRY_SUBJECTS } from "@/types/enquiry.types";

/**
 * Enquiry form schema — mirrored by the server handler at
 * `app/api/v1/enquiries/route.ts` (same rules, same messages), so the client
 * and the office always agree on what a valid enquiry is.
 */
export const enquirySchema = z.object({
  fullName: z.string().trim().min(1, "Please enter your name.").max(150),
  phone: z
    .string()
    .trim()
    .min(1, "We need a phone number to reach you.")
    .max(20),
  email: z
    .union([z.literal(""), z.string().email("Please enter a valid email.")])
    .optional(),
  subject: z.enum(ENQUIRY_SUBJECTS),
  message: z
    .string()
    .trim()
    .min(1, "Tell us briefly what you need so the right person calls you back.")
    .max(2000),
});

export type EnquiryValues = z.infer<typeof enquirySchema>;
