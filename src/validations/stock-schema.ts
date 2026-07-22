import { z } from "zod";

/**
 * Mirrors the backend `requestAdjustmentSchema`
 * (agritrade-backend src/validations/stock-validation.ts). The form holds a
 * positive quantity plus an add/remove direction (friendlier than typing a
 * minus sign on a phone); the submit handler signs the delta.
 */
export const adjustmentFormSchema = z.object({
  warehouseId: z.string().min(1, "Choose a warehouse"),
  commodityId: z.string().min(1, "Choose a commodity"),
  direction: z.enum(["ADD", "REMOVE"]),
  quantityKg: z
    .string()
    .trim()
    .min(1, "Enter the adjustment weight")
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) > 0, {
      message: "Enter a weight above zero",
    })
    .refine((v) => Number(v) <= 1_000_000, { message: "Adjustment too large" }),
  reason: z
    .string()
    .trim()
    .min(3, "Give the reason this stock moved")
    .max(500, "Keep the reason under 500 characters"),
});

export type AdjustmentFormValues = z.infer<typeof adjustmentFormSchema>;
