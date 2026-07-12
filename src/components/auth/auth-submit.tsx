"use client";

import { Button } from "@/components/ui/button";

/** Full-width console-green submit button with a busy state. */
export function AuthSubmit({
  isLoading,
  loadingText,
  children,
}: {
  isLoading: boolean;
  loadingText: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="submit"
      disabled={isLoading}
      className="mt-1 h-9 w-full bg-console text-[13.5px] font-semibold text-white hover:bg-console-deep"
    >
      {isLoading ? loadingText : children}
    </Button>
  );
}
