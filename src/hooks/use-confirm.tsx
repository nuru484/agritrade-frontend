"use client";

import { useCallback, useRef, useState } from "react";
import {
  ConfirmationDialog,
  type ConfirmationDialogProps,
} from "@/components/ui/ConfirmationDialog";

type ConfirmOptions = Omit<
  ConfirmationDialogProps,
  "onConfirm" | "onOpenChange" | "open"
>;

/**
 * Promise-based confirmation: `await confirm({...})` resolves true/false so
 * destructive handlers read top-to-bottom instead of threading dialog state.
 *
 *   const { confirm, confirmationDialog } = useConfirm();
 *   const onDelete = async () => {
 *     if (!(await confirm({ title: "Delete this file?", description: "…", isDestructive: true }))) return;
 *     …
 *   };
 *   return <>{confirmationDialog}…</>;
 */
export function useConfirm() {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((confirmed: boolean) => void) | null>(null);

  const confirm = useCallback(
    (opts: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        resolver.current = resolve;
        setOptions(opts);
      }),
    [],
  );

  const settle = useCallback((confirmed: boolean) => {
    resolver.current?.(confirmed);
    resolver.current = null;
    setOptions(null);
  }, []);

  const confirmationDialog = options ? (
    <ConfirmationDialog
      {...options}
      open
      onOpenChange={(open) => {
        if (!open) settle(false);
      }}
      onConfirm={() => settle(true)}
    />
  ) : null;

  return { confirm, confirmationDialog };
}
