import { FileText, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * "Nothing on file" — the empty document tray. A dashed file card with a
 * stencil header and an optional primary action, so empty never reads as
 * broken.
 */
export function EmptyState({
  icon: Icon = FileText,
  title = "Nothing on file yet",
  description = "When something is recorded it will be filed here.",
  actionLabel,
  onAction,
  className,
}: {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex w-full min-w-0 flex-col items-center justify-center px-3 py-10 text-center sm:px-6 sm:py-16",
        className,
      )}
    >
      <div className="w-[min(420px,100%)] min-w-0 border border-dashed border-soil/50 bg-surface-alt/60 px-4 py-8 sm:px-8 sm:py-10">
        <span className="stencil mb-6 inline-block border-b border-dotted border-soil/40 pb-2 text-[10px] tracking-[0.28em] text-harvest-deep">
          File empty
        </span>
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-[3px] border-2 border-soil/40 text-soil">
          <Icon aria-hidden="true" className="h-6 w-6" />
        </div>
        <h3 className="mb-2 break-words font-display text-[17px] font-semibold text-forest sm:text-[19px]">
          {title}
        </h3>
        <p className="mx-auto mb-0 max-w-[38ch] break-words text-[13px] leading-[1.65] text-soil sm:text-[13.5px]">
          {description}
        </p>
        {actionLabel && onAction ? (
          <Button onClick={onAction} className="mt-6">
            {actionLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
