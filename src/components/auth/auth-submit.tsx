"use client";

import { Button } from "@/components/ui/button";

/** Full-width submit in the client primary shape (harvest, ink text) with a
 * busy state. */
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
      variant="harvest"
      disabled={isLoading}
      className="mt-1 h-10 w-full text-[13.5px]"
    >
      {isLoading ? loadingText : children}
    </Button>
  );
}
