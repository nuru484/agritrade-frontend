import { NextResponse } from "next/server";
import { DEMO_PUBLIC_COMMODITIES } from "@/lib/public-commodities";

/**
 * Stand-in for `GET /api/v1/public/commodities` until
 * `NEXT_PUBLIC_SERVER_URI` points at the real agritrade-backend. Speaks the
 * exact backend envelope; the demo list is shared with the server-side stub
 * fallback so both stub paths always agree. By stub nature: availability is
 * hardcoded, nothing derives from stock.
 */
export function GET() {
  return NextResponse.json({
    message: "Commodities",
    data: { commodities: DEMO_PUBLIC_COMMODITIES },
  });
}
