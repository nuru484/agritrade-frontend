import { NextResponse } from "next/server";
import { DEMO_PUBLIC_LAND_PLOTS } from "@/lib/public-land";

/**
 * Stand-in for `GET /api/v1/public/land-plots` until the backend's land
 * module ships and `NEXT_PUBLIC_SERVER_URI` points at it. Speaks the exact
 * backend envelope; the demo register is shared with the server-side stub
 * fallback so both stub paths always agree.
 */
export function GET() {
  return NextResponse.json({
    message: "Land plots",
    data: { plots: DEMO_PUBLIC_LAND_PLOTS },
  });
}
