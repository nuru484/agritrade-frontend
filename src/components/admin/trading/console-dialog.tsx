"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/**
 * Console-flavoured dialog shell (rounded 10px card, dark scrim, tinted
 * headers for warn/void) on top of the shadcn Dialog so we keep focus
 * trapping and Escape/scrim dismissal for free.
 */
export function ConsoleDialog({
  open,
  onOpenChange,
  widthClass = "max-w-[440px] sm:max-w-[440px]",
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** e.g. "max-w-[460px] sm:max-w-[460px]" — design modals are 440–460px wide. */
  widthClass?: string;
  children: React.ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby={undefined}
        showCloseButton={false}
        overlayClassName="z-[80] bg-[rgba(11,15,20,0.45)] supports-backdrop-filter:backdrop-blur-none"
        className={cn(
          "z-[81] block w-[calc(100vw-32px)] gap-0 overflow-hidden rounded-none bg-paper p-0 font-admin leading-[1.5] text-ink shadow-[0_12px_40px_rgba(11,15,20,0.18)] ring-0 outline-none",
          widthClass,
        )}
      >
        {children}
      </DialogContent>
    </Dialog>
  );
}

/** shadcn DialogTitle worn plain — the console inherits font/leading from the card. */
export function ConsoleDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogTitle>) {
  return <DialogTitle className={cn("font-admin leading-[1.5]", className)} {...props} />;
}

/** Tinted banner header for warn (harvest) and destructive (red) dialogs. */
export function ConsoleDialogBanner({
  variant,
  icon,
  children,
}: {
  variant: "warn" | "danger";
  icon: string;
  children: React.ReactNode;
}) {
  const warn = variant === "warn";
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 border-b px-5 py-3.5",
        warn ? "border-[#EAD9AE] bg-[#F7EED8]" : "border-[#E5C4BF] bg-[#F8E9E7]",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "flex h-[26px] w-[26px] flex-none items-center justify-center rounded-full text-[14px] font-bold text-white",
          warn ? "bg-console-gold" : "bg-console-red",
        )}
      >
        {icon}
      </span>
      <ConsoleDialogTitle className={cn("text-[15px] font-bold", warn ? "text-[#7A5407]" : "text-console-red-deep")}>
        {children}
      </ConsoleDialogTitle>
    </div>
  );
}

/** Right-aligned footer on the gray-25 strip. */
export function ConsoleDialogFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap justify-end gap-2 border-t border-soil/15 bg-surface-alt/50 px-5 py-3.5">
      {children}
    </div>
  );
}
