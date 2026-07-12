"use client";

import { useState } from "react";
import { AdminButton, Mono, adminInputClass } from "@/components/admin/ui";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatCedis } from "@/lib/format-money";
import { purchaseTotal, type PurchaseRow } from "@/static-data/admin/trading";
import { ConsoleDialog, ConsoleDialogBanner, ConsoleDialogFooter } from "./console-dialog";

/**
 * Destructive void dialog (design "VOID (DESTRUCTIVE)"): requires a reason and
 * an explicit acknowledgement before the red button arms.
 */
export function VoidPurchaseDialog({
  purchase,
  onOpenChange,
  onConfirm,
}: {
  purchase: PurchaseRow | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (purchase: PurchaseRow, reason: string) => void;
}) {
  return (
    <ConsoleDialog open={purchase !== null} onOpenChange={onOpenChange}>
      {/* Body unmounts on close, so reason/checkbox reset per purchase. */}
      {purchase ? <VoidDialogBody purchase={purchase} onOpenChange={onOpenChange} onConfirm={onConfirm} /> : null}
    </ConsoleDialog>
  );
}

function VoidDialogBody({
  purchase,
  onOpenChange,
  onConfirm,
}: {
  purchase: PurchaseRow;
  onOpenChange: (open: boolean) => void;
  onConfirm: (purchase: PurchaseRow, reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  const [checked, setChecked] = useState(false);
  const armed = checked && reason.trim().length > 0;

  return (
    <>
      <ConsoleDialogBanner variant="danger" icon="!">
        Void purchase {purchase.ref}
      </ConsoleDialogBanner>
      <div className="px-5 py-[18px]">
        <p className="text-[14px] leading-[1.55] text-slate-800">
          This reverses <Mono className="font-bold">{formatCedis(purchaseTotal(purchase))}</Mono> back to{" "}
          {purchase.agent.split(" ")[0]}&apos;s float and removes the stock from Main Warehouse. The record stays in
          the register, struck through.
        </p>
        <label className="mt-3.5 block">
          <span className="mb-[5px] block text-[13px] font-semibold text-slate-700">Reason</span>
          <Input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. duplicate entry"
            className={cn(adminInputClass, "dark:bg-white")}
          />
        </label>
        <label className="mt-3.5 flex cursor-pointer items-start gap-[9px] text-[13px] text-slate-700">
          <Checkbox
            checked={checked}
            onCheckedChange={(v) => setChecked(v === true)}
            className="mt-0.5 size-[15px] rounded-[3px] border-slate-400 bg-white data-checked:border-console-red data-checked:bg-console-red data-checked:text-white dark:bg-white dark:data-checked:bg-console-red"
          />
          <span>I understand this cannot be undone from this screen.</span>
        </label>
      </div>
      <ConsoleDialogFooter>
        <AdminButton variant="secondary" onClick={() => onOpenChange(false)}>
          Cancel
        </AdminButton>
        <AdminButton
          variant="danger"
          disabled={!armed}
          className={armed ? undefined : "opacity-45"}
          onClick={() => onConfirm(purchase, reason.trim())}
        >
          Void purchase
        </AdminButton>
      </ConsoleDialogFooter>
    </>
  );
}
