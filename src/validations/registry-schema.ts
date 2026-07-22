import { z } from "zod";
import { PurchaseSource } from "@/types/registry.types";

/**
 * Registry form schemas, mirroring the backend validations in
 * agritrade-backend `src/validations/{commodity,warehouse,supplier,buyer,
 * expense-category}-validation.ts` so the client rejects the same input the
 * server would. Optional text fields accept "" here and the submit handlers
 * omit empty values (create) or send null (edit clears).
 */

const optionalText = (max: number) =>
  z.string().trim().max(max).or(z.literal("")).optional();

/** Backend: min 6 / max 20; "" means "not provided". */
const phoneField = z
  .string()
  .trim()
  .min(6, "Enter a full phone number")
  .max(20)
  .or(z.literal(""))
  .optional();

export const commoditySchema = z.object({
  name: z.string().trim().min(2, "Enter the commodity name").max(100),
  variety: optionalText(100),
  qualityGrade: optionalText(50),
  description: optionalText(1000),
  /** Kept as a string so the field can be emptied while typing. */
  bagWeightKg: z
    .string()
    .trim()
    .refine((v) => v === "" || (Number(v) > 0 && Number(v) <= 1000), {
      message: "Enter a weight between 0 and 1000 kg",
    })
    .optional(),
  sortOrder: z
    .string()
    .trim()
    .refine(
      (v) => v === "" || (Number.isInteger(Number(v)) && Number(v) >= 0),
      { message: "Enter a whole number" },
    )
    .optional(),
});
export type CommodityValues = z.infer<typeof commoditySchema>;

export const warehouseSchema = z.object({
  name: z.string().trim().min(2, "Enter the warehouse name").max(100),
  location: optionalText(200),
});
export type WarehouseValues = z.infer<typeof warehouseSchema>;

export const supplierSchema = z.object({
  name: z.string().trim().min(2, "Enter the supplier's name").max(150),
  phone: phoneField,
  community: optionalText(120),
  sourceType: z.enum(PurchaseSource),
  notes: optionalText(1000),
});
export type SupplierValues = z.infer<typeof supplierSchema>;

export const buyerSchema = z.object({
  name: z.string().trim().min(2, "Enter the buyer's name").max(150),
  phone: phoneField,
  email: z.email("Enter a valid email").max(255).or(z.literal("")).optional(),
  city: optionalText(120),
  notes: optionalText(1000),
});
export type BuyerValues = z.infer<typeof buyerSchema>;

export const expenseCategorySchema = z.object({
  name: z.string().trim().min(2, "Enter the category name").max(100),
});
export type ExpenseCategoryValues = z.infer<typeof expenseCategorySchema>;
