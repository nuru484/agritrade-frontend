"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

import { AdminField, adminInputClass, Mono } from "@/components/admin/ui";
import { Input } from "@/components/ui/input";
import { notify } from "@/lib/notify";
import { cn } from "@/lib/utils";

/**
 * A value people paste somewhere else (a transfer reference, a transaction
 * ID), labelled, with a button that copies it. The button's hit area is grown
 * to 44px with a pseudo-element, so the row it sits in keeps its height.
 */
export function CopyValue({
  className,
  label,
  value,
}: {
  className?: string;
  label: string;
  value: string;
}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      notify.success(`${label} copied`);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      notify.error("Couldn't copy - select the text and copy it instead.");
    }
  };
  const Icon = copied ? Check : Copy;
  return (
    <span className={cn("inline-flex min-w-0 items-center gap-1", className)}>
      <span className="flex-none text-adm-faint">{label}</span>
      <Mono className="min-w-0 text-adm-ink select-all [overflow-wrap:anywhere]">
        {value}
      </Mono>
      <button
        aria-label={`Copy ${label.toLowerCase()} ${value}`}
        className="relative inline-flex size-5 flex-none cursor-pointer items-center justify-center text-adm-muted transition-colors after:absolute after:-inset-3 hover:text-adm-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-adm-ink"
        onClick={() => void copy()}
        type="button"
      >
        <Icon aria-hidden className="size-3.5" />
      </button>
    </span>
  );
}

/**
 * The two handles a payment can be found by, each copyable. Renders nothing
 * when the payment carries neither.
 */
export function PaymentHandles({
  className,
  reference,
  transactionId,
}: {
  className?: string;
  reference: null | string;
  transactionId: null | string;
}) {
  if (!reference && !transactionId) return null;
  return (
    <div
      className={cn(
        "flex flex-wrap gap-x-4 gap-y-1 text-[10.5px] leading-5",
        className,
      )}
    >
      {reference ? <CopyValue label="Ref" value={reference} /> : null}
      {transactionId ? (
        <CopyValue label="Transaction ID" value={transactionId} />
      ) : null}
    </div>
  );
}

/**
 * The provider transaction ID input every payment form carries. Optional; the
 * server stores it uppercase without spaces and refuses one already on another
 * standing payment in the same book (DUPLICATE_TRANSACTION_ID).
 */
export function TransactionIdField({
  error,
  registration,
}: {
  error?: string;
  registration: UseFormRegisterReturn;
}) {
  return (
    <AdminField
      error={error}
      hint="The MoMo or bank transaction ID. Each one is recorded once: an ID already on another payment is refused."
      label="Transaction ID"
      optional
    >
      <Input
        autoCapitalize="characters"
        autoComplete="off"
        className={adminInputClass}
        placeholder="e.g. 61234567890"
        spellCheck={false}
        {...registration}
      />
    </AdminField>
  );
}
