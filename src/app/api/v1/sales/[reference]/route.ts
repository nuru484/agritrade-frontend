import { NextResponse } from "next/server";
import { findSale } from "../_store";

/** Stand-in `GET /api/v1/sales/:reference` — same envelope as the real API. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ reference: string }> },
) {
  const { reference } = await params;
  const sale = findSale(reference);
  if (!sale) {
    return NextResponse.json(
      {
        status: "error",
        message: "Reference not found.",
        code: "NOT_FOUND",
      },
      { status: 404 },
    );
  }
  return NextResponse.json({ message: "Sale retrieved", data: sale });
}
