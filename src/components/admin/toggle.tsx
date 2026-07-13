"use client";

import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

/** Console switch: shadcn Switch pinned to the design's 36×21 pill —
 * forest when on, the design's cool gray when off. */
export function AdminToggle({
  checked,
  onChange,
  label,
  className,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  /** Accessible name when the switch has no visible associated label. */
  label?: string;
  className?: string;
}) {
  return (
    <Switch
      checked={checked}
      onCheckedChange={onChange}
      aria-label={label}
      className={cn(
        "h-[21px] w-9 data-[state=checked]:bg-console data-[state=unchecked]:bg-husk",
        className,
      )}
    />
  );
}
