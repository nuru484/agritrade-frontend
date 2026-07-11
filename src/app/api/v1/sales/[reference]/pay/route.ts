import { NextResponse } from "next/server";
import { findSale } from "../../_store";

/**
 * Stand-in `POST /api/v1/sales/:reference/pay`. The real API returns a Hubtel
 * `authorizationUrl` to continue checkout; the stand-in settles the demo sale
 * immediately so the whole flow can be exercised end to end.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ reference: string }> },
) {
  const { reference } = await params;
  const sale = findSale(reference);
  if (!sale) {
    return NextResponse.json(
      { status: "error", message: "Reference not found.", code: "NOT_FOUND" },
      { status: 404 },
    );
  }
  if (sale.status === "SETTLED") {
    return NextResponse.json(
      {
        status: "error",
        message: "Nothing outstanding on this sale.",
        code: "ALREADY_PAID",
      },
      { status: 400 },
    );
  }
  return NextResponse.json(
    {
      message: "Payment received",
      data: {
        reference: sale.reference,
        amountPaid: sale.amountOutstanding,
        currency: sale.currency,
      },
    },
    { status: 201 },
  );
}
