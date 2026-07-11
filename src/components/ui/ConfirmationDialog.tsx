"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  /** Extra friction for irreversible actions: user must type this exactly. */
  requireExactMatch?: string;
}

/**
 * The confirm gate (dms-frontend convention, worn in this design's paperwork
 * style): title, plain-language consequence, optional type-to-confirm, and a
 * destructive variant that goes error-red.
 */
export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false,
  requireExactMatch,
}: ConfirmationDialogProps) {
  const [inputValue, setInputValue] = useState("");

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) setInputValue("");
  };

  const confirmDisabled = requireExactMatch
    ? inputValue !== requireExactMatch
    : false;

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="shadow-doc rounded-[3px] border-soil/35 bg-paper">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display text-forest">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-soil">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {requireExactMatch ? (
          <div className="space-y-2">
            <Label htmlFor="confirm-input" className="inline leading-relaxed">
              Type{" "}
              <span className="font-mono font-bold">{requireExactMatch}</span>{" "}
              to confirm:
            </Label>
            <Input
              id="confirm-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={requireExactMatch}
              className="font-mono"
            />
          </div>
        ) : null}

        <AlertDialogFooter className="justify-end gap-2">
          <AlertDialogCancel className="m-0">{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={confirmDisabled}
            className={cn(
              isDestructive && "bg-error text-surface hover:bg-error/90",
            )}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
