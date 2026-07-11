"use client";

import { ErrorMessage } from "@/components/ui/ErrorMessage";

/** Route-segment error boundary — the failed-document state with a reset. */
export default function ErrorBoundary({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorMessage
      className="min-h-[60vh]"
      title="This page didn't go through"
      description="Something went wrong on our side. Try again — if it keeps failing, call the office on +233 24 000 0000."
      onRetry={reset}
    />
  );
}
