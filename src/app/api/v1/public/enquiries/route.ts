import { NextResponse } from "next/server";
import { z } from "zod";
import { enquirySchema } from "@/validations/enquiry-schema";

/**
 * Stand-in office for `POST /api/v1/public/enquiries` until
 * `NEXT_PUBLIC_SERVER_URI` points at the real agritrade-backend. Speaks the
 * exact same contract (success `{ message, data }`, error
 * `{ status, message, code, details.errors[] }`, honeypot 403), so the
 * frontend needs zero changes when the real API takes over. Differences from
 * the real thing, by stub nature: nothing is stored or emailed, Turnstile
 * tokens aren't verified, and the phone isn't normalized to E.164.
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

  // Honeypot — mirror the backend's bot-protection middleware: a filled
  // hidden field means "not a person", rejected before validation.
  const honeypot = (body as Record<string, unknown> | null)?.website;
  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    return NextResponse.json(
      { status: "error", message: "Request rejected.", code: "BOT_DETECTED" },
      { status: 403 },
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

  // The honeypot travels through validation but never into the "stored" data.
  const enquiry = { ...parsed.data };
  delete enquiry.website;
  const id = crypto.randomUUID();
  const reference = `EN-${id.slice(0, 4).toUpperCase()}`;
  return NextResponse.json(
    {
      message: "Enquiry received",
      data: {
        ...enquiry,
        id,
        reference,
        receivedAt: new Date().toISOString(),
      },
    },
    { status: 201 },
  );
}
