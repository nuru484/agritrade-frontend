import { env } from "@/lib/env";
import {
  availabilityBoard,
  commodityLots,
  type CommodityLine,
  type CommodityLot,
} from "@/static-data/availability";

/**
 * The live availability feed behind the plank board and the lot files.
 *
 * Data source rules:
 * - `NEXT_PUBLIC_SERVER_URI` set: fetch the real backend with a 5-minute ISR
 *   window. Any failure falls back to the static board - the public site
 *   must never 500 (or look empty) because the API is down.
 * - env empty (stub mode): serve the demo list below directly - a server
 *   component cannot reliably fetch its own origin, and the shared demo data
 *   keeps the stub route handler and this fallback in perfect agreement.
 */

/** Mirrors the backend `PublicCommodityDTO`. */
export interface PublicCommodity {
  id: string;
  name: string;
  description: string | null;
  photo: string | null;
  variety: string | null;
  qualityGrade: string | null;
  available: boolean;
}

/** Demo feed for stub mode - matches the static board's story. */
export const DEMO_PUBLIC_COMMODITIES: PublicCommodity[] = [
  {
    id: "demo-maize",
    name: "Maize",
    description: null,
    photo: null,
    variety: null,
    qualityGrade: null,
    available: true,
  },
  {
    id: "demo-soya",
    name: "Soya beans",
    description: null,
    photo: null,
    variety: null,
    qualityGrade: null,
    available: true,
  },
  {
    id: "demo-groundnuts",
    name: "Groundnuts",
    description: null,
    photo: null,
    variety: null,
    qualityGrade: null,
    available: false,
  },
];

/** Fetches the published commodities, or null when the API is unreachable. */
export async function fetchPublicCommodities(): Promise<
  PublicCommodity[] | null
> {
  if (!env.SERVER_URI) return DEMO_PUBLIC_COMMODITIES;
  try {
    const res = await fetch(`${env.SERVER_URI}/api/v1/public/commodities`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const body = (await res.json()) as {
      data?: { commodities?: PublicCommodity[] };
    };
    return body.data?.commodities ?? null;
  } catch {
    return null;
  }
}

const byName = <T extends { name: string }>(items: T[]) =>
  new Map(items.map((item) => [item.name.trim().toLowerCase(), item]));

/**
 * Board lines from the live feed, keeping the static market-context copy
 * where names match. Null (API down) or an empty publish list keeps the
 * static board unchanged - a commodity never disappears, and the board never
 * renders bare.
 */
export function toBoardLines(
  commodities: PublicCommodity[] | null,
): CommodityLine[] {
  if (!commodities || commodities.length === 0) return availabilityBoard;
  const staticByName = byName<CommodityLine>(availabilityBoard);
  return commodities.map((c) => {
    const known = staticByName.get(c.name.trim().toLowerCase());
    return {
      name: c.name,
      available: c.available,
      meta:
        known?.meta ??
        ([c.variety, c.qualityGrade].filter(Boolean).join(" · ") ||
          "Call for today's position"),
    };
  });
}

/** A lot file merged from the live feed and the static rich content. */
export interface MergedLot extends Omit<CommodityLot, "photo" | "boardName"> {
  photo: string | null;
  inStock: boolean;
}

/**
 * Lot files from the live feed: API commodities matched to the static lot
 * content by name keep their rich copy and photography; API-only commodities
 * render from their own fields (photo included when present). API down or
 * nothing published: the static files render exactly as before.
 */
export function toLots(commodities: PublicCommodity[] | null): MergedLot[] {
  if (!commodities || commodities.length === 0) {
    const boardByName = byName<CommodityLine>(availabilityBoard);
    return commodityLots.map((lot) => ({
      ...lot,
      photo: lot.photo,
      inStock:
        boardByName.get(lot.boardName.trim().toLowerCase())?.available ??
        false,
    }));
  }

  const lotByName = byName<CommodityLot>(
    commodityLots.map((l) => ({ ...l, name: l.name })),
  );
  return commodities.map((c, i) => {
    const known = lotByName.get(c.name.trim().toLowerCase());
    if (known) {
      return { ...known, photo: c.photo ?? known.photo, inStock: c.available };
    }
    return {
      name: c.name,
      lotNo: `LOT-${String(i + 1).padStart(2, "0")}`,
      ghost: c.name.toUpperCase(),
      grades:
        [c.variety, c.qualityGrade].filter(Boolean).join(", ") ||
        "Graded to trade standard - call for the current specification",
      season: c.description ?? "Ask for the current position",
      soldAs: "Full truckloads, bagged and weighed over a certified scale",
      photo: c.photo,
      photoAlt: `${c.name} from the DB Plus warehouse`,
      subject: `${c.name} enquiry`,
      inStock: c.available,
    };
  });
}
