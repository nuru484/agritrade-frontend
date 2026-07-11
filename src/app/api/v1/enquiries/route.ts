import { NextResponse } from "next/server";
import { z } from "zod";
import { enquirySchema } from "@/validations/enquiry-schema";

/**
 * Stand-in office for `POST /api/v1/enquiries` until the dedicated backend
 * ships. Speaks the exact same contract the real API will (success
 * `{ message, data }`, error `{ status, message, details.errors[] }`), so the
 * frontend needs zero changes when `NEXT_PUBLIC_SERVER_URI` starts pointing
 * at the real thing.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { status: "error", message: "Send the enquiry as JSON." },
      { status: 400 },
    );
  }

  const parsed = enquirySchema.safeParse(body);
  if (!parsed.success) {
    const errors = parsed.error.issues.map((issue: z.core.$ZodIssue) => ({
      field: issue.path.join(".") || "body",
      message: issue.message,
    }));
    return NextResponse.json(
      {
        status: "error",
        message: "Check the highlighted fields and try again.",
        code: "VALIDATION_ERROR",
        details: { errors },
      },
      { status: 400 },
    );
  }

  const id = crypto.randomUUID();
  const reference = `EN-${id.slice(0, 4).toUpperCase()}`;
  return NextResponse.json(
    {
      message: "Enquiry received",
      data: {
        ...parsed.data,
        id,
        reference,
        receivedAt: new Date().toISOString(),
      },
    },
    { status: 201 },
  );
}
