"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminButton, Mono, adminSelectClass } from "@/components/admin/ui";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { notify } from "@/lib/notify";
import { cn } from "@/lib/utils";
import { formatCedis } from "@/lib/format-money";
import {
  purchaseAgents,
  purchaseCommodities,
  purchaseWarehouses,
  type PurchaseRow,
} from "@/static-data/admin/trading";
import { BackLink } from "./bits";

export interface PurchaseFormProps {
  /** Present when editing; prefill without it means "duplicate as new". */
  editRef?: string;
  prefill?: PurchaseRow;
}

interface FieldErrors {
  weight?: string;
  price?: string;
}

const groupLabelClass = "mb-3.5 text-[10.5px] font-bold uppercase tracking-[0.1em] text-slate-400";
const fieldLabelClass = "mb-[5px] block text-[13px] font-semibold text-slate-700";

/** Console 38px select skin on the shadcn SelectTrigger (data-size beats plain h-*). */
const formSelectTriggerClass = cn(adminSelectClass, "justify-between data-[size=default]:h-[38px]");

/** Bare mono amount input used inside the bordered unit-affix groups. */
const affixInputClass =
  "h-full min-w-0 flex-1 rounded-none border-0 bg-transparent px-2.5 py-0 text-right font-adminmono text-[14px] tabular-nums text-slate-900 shadow-none outline-none placeholder:text-slate-400 focus-visible:ring-0 aria-invalid:ring-0 dark:bg-transparent";

export function PurchaseForm({ editRef, prefill }: PurchaseFormProps) {
  const router = useRouter();
  const editing = Boolean(editRef);

  const [agent, setAgent] = useState(prefill?.agent ?? purchaseAgents[0]);
  const [supplier, setSupplier] = useState(prefill?.supplier ?? "");
  const [warehouse, setWarehouse] = useState(purchaseWarehouses[0]);
  const [commodity, setCommodity] = useState(prefill?.commodity ?? purchaseCommodities[0]);
  const [weight, setWeight] = useState(prefill ? String(prefill.weightKg) : "");
  const [price, setPrice] = useState(prefill ? prefill.pricePerKg.toFixed(2) : "");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);

  const weightNum = parseFloat(weight.replace(/,/g, ""));
  const priceNum = parseFloat(price.replace(/,/g, ""));
  const calcWeight = Number.isFinite(weightNum) ? weightNum : 0;
  const calcPrice = Number.isFinite(priceNum) ? priceNum : 0;

  const problems = [errors.weight, errors.price].filter(Boolean).length;

  const submit = () => {
    const next: FieldErrors = {};
    if (!Number.isFinite(weightNum) || weightNum <= 0) next.weight = "Enter the weight in kilograms.";
    if (!Number.isFinite(priceNum) || priceNum <= 0) next.price = "Enter the price per kilogram.";
    setErrors(next);
    if (next.weight || next.price) return;

    setSaving(true);
    // Stub save: no backend yet — pause briefly, toast, return to the register.
    window.setTimeout(() => {
      notify.success(editing ? `Purchase ${editRef} updated` : "Purchase P-0892 recorded");
      router.push("/admin/purchases");
    }, 600);
  };

  return (
    <div className="max-w-[620px]">
      <BackLink href="/admin/purchases">Purchases</BackLink>
      <h1 className="mb-1 text-[22px] font-bold tracking-[-0.01em] text-slate-900">
        {editing ? `Edit purchase ${editRef}` : "Record purchase"}
      </h1>
      <div className="mb-[18px] text-[13px] text-slate-500">
        {editing ? "Changes are logged in the audit trail" : "Buy goods from a supplier or farmer"}
      </div>

      {problems > 0 ? (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2.5 rounded-[8px] border border-[#E5C4BF] bg-[#F8E9E7] px-3.5 py-3 text-[13px] text-console-red-deep"
        >
          <span className="font-bold">!</span>
          <span>
            Fix {problems} problem{problems > 1 ? "s" : ""} before recording:{" "}
            {errors.weight ? (
              <>
                <strong>Weight</strong> is missing{errors.price ? ", " : "."}
              </>
            ) : null}
            {errors.price ? (
              <>
                <strong>Price per kg</strong> is missing.
              </>
            ) : null}
          </span>
        </div>
      ) : null}

      <div className="rounded-[8px] border border-slate-200 bg-white p-5">
        <div className={groupLabelClass}>Who &amp; where</div>
        <div className="mb-[22px] flex flex-col gap-3.5">
          <label className="block">
            <span className={fieldLabelClass}>Agent</span>
            <Select value={agent} onValueChange={setAgent}>
              <SelectTrigger className={formSelectTriggerClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {purchaseAgents.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <label className="block">
            <span className={fieldLabelClass}>Supplier</span>
            <Input
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              placeholder="Search or add supplier…"
              className="h-[38px] w-full rounded-[6px] border-slate-300 bg-white px-2.5 text-[14px] text-slate-900 shadow-none outline-none placeholder:text-slate-400 focus:border-console focus:shadow-[0_0_0_2px_rgb(30_61_43/0.15)] focus-visible:border-console focus-visible:ring-0 dark:bg-white"
            />
          </label>
          <label className="block">
            <span className={fieldLabelClass}>Warehouse</span>
            <Select value={warehouse} onValueChange={setWarehouse}>
              <SelectTrigger className={formSelectTriggerClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {purchaseWarehouses.map((w) => (
                  <SelectItem key={w} value={w}>
                    {w}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
        </div>

        <div className={groupLabelClass}>Goods</div>
        <div className="flex flex-col gap-3.5">
          <label className="block">
            <span className={fieldLabelClass}>Commodity</span>
            <Select value={commodity} onValueChange={setCommodity}>
              <SelectTrigger className={formSelectTriggerClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {purchaseCommodities.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <div className="grid gap-3.5 sm:grid-cols-2">
            <div>
              <label htmlFor="purchase-weight" className={fieldLabelClass}>
                Weight
              </label>
              <div
                className={cn(
                  "flex h-[38px] items-center overflow-hidden rounded-[6px] border bg-white",
                  errors.weight ? "border-console-red" : "border-slate-300 focus-within:border-console",
                )}
              >
                <Input
                  id="purchase-weight"
                  value={weight}
                  onChange={(e) => {
                    setWeight(e.target.value);
                    setErrors((prev) => ({ ...prev, weight: undefined }));
                  }}
                  placeholder="0"
                  inputMode="decimal"
                  aria-invalid={Boolean(errors.weight)}
                  className={affixInputClass}
                />
                <span className="flex h-full items-center border-l border-slate-200 bg-slate-50 px-2.5 text-[13px] text-slate-500">
                  kg
                </span>
              </div>
              {errors.weight ? <div className="mt-1 text-[12px] text-console-red">{errors.weight}</div> : null}
            </div>
            <div>
              <label htmlFor="purchase-price" className={fieldLabelClass}>
                Price per kg
              </label>
              <div
                className={cn(
                  "flex h-[38px] items-center overflow-hidden rounded-[6px] border bg-white",
                  errors.price ? "border-console-red" : "border-slate-300 focus-within:border-console",
                )}
              >
                <span className="flex h-full items-center border-r border-slate-200 bg-slate-50 px-2.5 text-[13px] text-slate-500">
                  GH₵
                </span>
                <Input
                  id="purchase-price"
                  value={price}
                  onChange={(e) => {
                    setPrice(e.target.value);
                    setErrors((prev) => ({ ...prev, price: undefined }));
                  }}
                  placeholder="0.00"
                  inputMode="decimal"
                  aria-invalid={Boolean(errors.price)}
                  className={affixInputClass}
                />
              </div>
              {errors.price ? <div className="mt-1 text-[12px] text-console-red">{errors.price}</div> : null}
            </div>
          </div>
          <div className="flex items-center justify-between rounded-[6px] border border-slate-200 bg-slate-50 px-3.5 py-[11px]">
            <Mono className="text-[13px] text-slate-500">
              {calcWeight ? calcWeight.toLocaleString("en-GH") : "0"} kg × GH₵ {calcPrice ? calcPrice.toFixed(2) : "0.00"} =
            </Mono>
            <Mono className="text-[16px] font-bold">{formatCedis(calcWeight * calcPrice)}</Mono>
          </div>
          <label className="block">
            <span className={fieldLabelClass}>
              Notes <span className="font-normal text-slate-400">(optional)</span>
            </span>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Moisture, bags, quality notes…"
              className="field-sizing-fixed min-h-0 w-full resize-y rounded-[6px] border-slate-300 bg-white px-2.5 py-2 text-[14px] text-slate-900 shadow-none outline-none placeholder:text-slate-400 focus:border-console focus-visible:border-console focus-visible:ring-0 dark:bg-white"
            />
          </label>
        </div>
      </div>

      <div className="mt-4 flex gap-2.5">
        <AdminButton className="h-10 px-[22px] text-[14px]" disabled={saving} onClick={submit}>
          {saving ? "Recording…" : editing ? "Save changes" : "Record purchase"}
        </AdminButton>
        <AdminButton
          variant="secondary"
          className="h-10 px-[18px] text-[14px]"
          onClick={() => router.push("/admin/purchases")}
        >
          Cancel
        </AdminButton>
      </div>
    </div>
  );
}
