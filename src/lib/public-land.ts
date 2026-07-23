import { CACHE_TAGS } from "@/config/cache-tags";
import { env } from "@/lib/env";

/**
 * The live plot register behind /land.
 *
 * Data source rules (same seam as public-commodities):
 * - `NEXT_PUBLIC_SERVER_URI` set: fetch `GET /api/v1/public/land-plots`,
 *   cached under the `land-plots` tag; the backend purges the tag when the
 *   land register changes, with the 1-hour ISR window as the backstop. The
 *   endpoint ships with the backend's land module - until it exists, the
 *   fetch reads as unavailable and the page renders the empty register.
 * - env empty (stub mode): serve the demo plots directly, shared with the
 *   stub route handler so both stub paths always agree.
 *
 * Emptiness is honest BY DESIGN: no published plots (or the API down)
 * renders the "NO PLOTS ON FILE" ledger page, never stand-in listings.
 */

export type PublicPlotStatus = "AVAILABLE" | "RESERVED";

/**
 * Wire contract for the backend's public land-plots DTO (design doc 5.9):
 * published, non-sold plots only; `priceGhs` is a decimal string present
 * only when the owner shows that plot's price; ownership documents are
 * never part of this payload.
 */
export interface PublicLandPlot {
  id: string;
  /** Register code, e.g. "TML-014". */
  reference: string;
  /** Display title, e.g. "Kumbungu Road, Plot 14". */
  name: string;
  /** Free-text size convention, e.g. "100 × 100 ft". */
  sizeText: string;
  /** Intended use, e.g. "residential". */
  use: string | null;
  /** Decimal GHS (e.g. "45000.00"); null when the price stays off the site. */
  priceGhs: string | null;
  status: PublicPlotStatus;
  photo: string | null;
  photoAlt: string | null;
}

/** Demo register for stub mode - matches the site's launch story. */
export const DEMO_PUBLIC_LAND_PLOTS: PublicLandPlot[] = [
  {
    id: "demo-tml-014",
    reference: "TML-014",
    name: "Kumbungu Road, Plot 14",
    sizeText: "100 × 100 ft",
    use: "residential",
    priceGhs: "45000.00",
    status: "AVAILABLE",
    photo:
      "https://commons.wikimedia.org/wiki/Special:FilePath/A%20green%20farm%20lands%20in%20northern%20ghana.jpg?width=1000",
    photoAlt: "Green farmland on Kumbungu Road, northern Ghana",
  },
  {
    id: "demo-tml-008",
    reference: "TML-008",
    name: "Nyankpala Road, Plot 8",
    sizeText: "100 × 100 ft",
    use: "residential",
    priceGhs: null,
    status: "RESERVED",
    photo:
      "https://commons.wikimedia.org/wiki/Special:FilePath/A%20prepared%20pepper%20farm%20in%20northern%20ghana.jpg?width=1000",
    photoAlt: "Prepared farmland on Nyankpala Road, northern Ghana",
  },
];

/** Fetches the published plots, or null when the API is unreachable. */
export async function fetchPublicLandPlots(): Promise<PublicLandPlot[] | null> {
  if (!env.SERVER_URI) return DEMO_PUBLIC_LAND_PLOTS;
  try {
    const res = await fetch(`${env.SERVER_URI}/api/v1/public/land-plots`, {
      next: { revalidate: 3600, tags: [CACHE_TAGS.LAND_PLOTS] },
    });
    if (!res.ok) return null;
    const body = (await res.json()) as {
      data?: { plots?: PublicLandPlot[] };
    };
    return body.data?.plots ?? null;
  } catch {
    return null;
  }
}
