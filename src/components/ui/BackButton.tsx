"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Standard dashboard back control — placed at the TOP-LEFT of detail, create
 * and edit pages, above the page header (dms convention): just the arrow and
 * the label, no border. Uses history when the visitor navigated here in-app;
 * falls back to `href` on a direct/deep link so it never dead-ends.
 */
export function BackButton({
  href,
  label = "Back",
  className,
}: {
  /** Where to go when there's no in-app history (deep link, refresh). */
  href: string;
  label?: string;
  className?: string;
}) {
  const router = useRouter();

  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push(href);
  };

  return (
    <button
      type="button"
      onClick={goBack}
      className={cn(
        "-ml-1.5 inline-flex h-8 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-[6px] px-1.5 text-[12.5px] font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800",
        className,
      )}
    >
      <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
    </button>
  );
}
