/**
 * Central site config — canonical URL, brand strings, and SEO defaults.
 *
 * The base URL comes from `NEXT_PUBLIC_BASE_URL` with a production fallback,
 * centralised here (khadys-kitchen convention) so nothing redeclares origins.
 * Trailing slash is stripped so `${siteUrl}/path` is always safe.
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_BASE_URL || "https://dbplus.com"
).replace(/\/$/, "");

export const siteConfig = {
  name: "DB Plus",
  legalName: "DB Plus Trading Ltd",
  shortName: "DB Plus",
  /** Full home-page title (the layout template's `default`). */
  title: "DB Plus · Bulk grain trading from Tamale, Ghana",
  description:
    "Maize, soya beans and groundnuts bought at the farm gate across Ghana's Northern Region — weighed honestly, aggregated in Tamale and trucked south by the load.",
  locale: "en_GH",
  phone: "+233 24 000 0000",
  phoneHref: "tel:+233240000000",
  whatsappHref: "https://wa.me/233240000000",
  email: "info@dbplus.example",
  address: "Industrial Area, off Bolgatanga Road, Tamale, Northern Region",
  hours: "Mon – Sat 7:00 – 17:00 · Sunday closed",
  city: "Tamale",
  country: "Ghana",
  /** Viridian forest — theme-color and the OG image field. */
  themeColor: "#155744",
  /** Pale husk page background. */
  backgroundColor: "#EFF1E8",
  ink: "#1F211C",
  keywords: [
    "DB Plus",
    "grain trading Ghana",
    "maize supplier Ghana",
    "soya beans Ghana",
    "groundnuts supplier",
    "Tamale commodities",
    "Northern Region maize",
    "bulk grain Accra",
    "bulk grain Kumasi",
    "agro commodities Tamale",
    "farm gate aggregation",
    "truckload grain delivery",
  ],
} as const;
