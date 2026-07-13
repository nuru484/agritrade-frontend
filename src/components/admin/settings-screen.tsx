"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AdminButton,
  AdminCard,
  AdminField,
  AdminPageHeader,
  adminInputClass,
  adminSelectClass,
} from "@/components/admin/ui";
import { AdminToggle } from "@/components/admin/toggle";
import { notify } from "@/lib/notify";
import { cn } from "@/lib/utils";

const TOGGLE_LABELS = [
  "Require approval for voids and cancellations",
  "Hide money columns for office staff by default",
  "Require photo on agent purchases",
] as const;

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3.5 text-[10.5px] font-bold tracking-[0.1em] text-soil/70 uppercase">
      {children}
    </div>
  );
}

/** Bordered number input with a unit addon (% suffix / GH₵ prefix). */
function UnitInput({
  unit,
  side,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  unit: string;
  side: "prefix" | "suffix";
  error?: boolean;
}) {
  const addon = (
    <span
      className={cn(
        "flex h-full items-center bg-surface-alt px-2.5 text-[13px] text-soil",
        side === "suffix" ? "border-l border-soil/25" : "border-r border-soil/25",
      )}
    >
      {unit}
    </span>
  );
  return (
    <div
      className={cn(
        "flex h-[42px] items-center overflow-hidden rounded-[2px] border-[1.5px] bg-[#FBFCF7] transition-[border-color,box-shadow] focus-within:border-leaf focus-within:shadow-[0_0_0_3px_rgb(62_125_98/0.16)]",
        error ? "border-error" : "border-soil/35",
      )}
    >
      {side === "prefix" ? addon : null}
      <Input
        inputMode="decimal"
        className="font-adminmono h-full min-w-0 flex-1 rounded-none border-0 bg-transparent px-2.5 py-0 text-right text-[14px] tabular-nums text-ink outline-none placeholder:text-soil/55 focus-visible:ring-0"
        {...props}
      />
      {side === "suffix" ? addon : null}
    </div>
  );
}

interface SettingsErrors {
  name?: string;
  milestone?: string;
  expense?: string;
}

export function SettingsScreen() {
  const [name, setName] = useState("DB Plus Trading Ltd");
  const [milestone, setMilestone] = useState("80");
  const [expense, setExpense] = useState("500");
  const [toggles, setToggles] = useState<boolean[]>([true, true, false]);
  const [errors, setErrors] = useState<SettingsErrors>({});

  const save = () => {
    const next: SettingsErrors = {};
    if (!name.trim()) next.name = "Enter the business name.";
    const pct = Number(milestone);
    if (!milestone.trim() || Number.isNaN(pct) || pct < 0 || pct > 100) {
      next.milestone = "Enter a percentage between 0 and 100.";
    }
    const amt = Number(expense);
    if (!expense.trim() || Number.isNaN(amt) || amt < 0) {
      next.expense = "Enter a valid amount.";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    notify.success("Settings saved");
  };

  return (
    <div className="max-w-[620px]">
      <AdminPageHeader title="Settings" sub="Business rules and defaults" />

      <div className="flex flex-col gap-4">
        <AdminCard className="px-5 py-[18px]">
          <SectionLabel>Business</SectionLabel>
          <div className="flex flex-col gap-[13px]">
            <AdminField label="Business name" error={errors.name}>
              <Input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrors((er) => ({ ...er, name: undefined }));
                }}
                className={cn(adminInputClass, errors.name && "border-error")}
              />
            </AdminField>
            <div className="grid gap-[13px] sm:grid-cols-2">
              <AdminField label="Currency">
                <Select defaultValue="GH₵ — Ghana cedi">
                  <SelectTrigger
                    className={cn(adminSelectClass, "data-[size=default]:h-[38px]")}
                  >
                    {/* Static children keep the label server-rendered. */}
                    <SelectValue>GH₵ — Ghana cedi</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GH₵ — Ghana cedi">GH₵ — Ghana cedi</SelectItem>
                  </SelectContent>
                </Select>
              </AdminField>
              <AdminField label="Timezone">
                <Select defaultValue="Africa/Accra (GMT)">
                  <SelectTrigger
                    className={cn(adminSelectClass, "data-[size=default]:h-[38px]")}
                  >
                    {/* Static children keep the label server-rendered. */}
                    <SelectValue>Africa/Accra (GMT)</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Africa/Accra (GMT)">Africa/Accra (GMT)</SelectItem>
                  </SelectContent>
                </Select>
              </AdminField>
            </div>
          </div>
        </AdminCard>

        <AdminCard className="px-5 py-[18px]">
          <SectionLabel>Approvals &amp; thresholds</SectionLabel>
          <div className="flex flex-col gap-[13px]">
            <div className="grid gap-[13px] sm:grid-cols-2">
              <AdminField label="Dispatch payment milestone" error={errors.milestone}>
                <UnitInput
                  unit="%"
                  side="suffix"
                  value={milestone}
                  error={Boolean(errors.milestone)}
                  onChange={(e) => {
                    setMilestone(e.target.value);
                    setErrors((er) => ({ ...er, milestone: undefined }));
                  }}
                />
              </AdminField>
              <AdminField label="Expense approval above" error={errors.expense}>
                <UnitInput
                  unit="GH₵"
                  side="prefix"
                  value={expense}
                  error={Boolean(errors.expense)}
                  onChange={(e) => {
                    setExpense(e.target.value);
                    setErrors((er) => ({ ...er, expense: undefined }));
                  }}
                />
              </AdminField>
            </div>
            {TOGGLE_LABELS.map((label, i) => (
              <div key={label} className="flex items-center justify-between gap-3 py-1">
                <span className="text-[13.5px] text-ink">{label}</span>
                <AdminToggle
                  checked={toggles[i]}
                  label={label}
                  onChange={(next) =>
                    setToggles((ts) => ts.map((v, vi) => (vi === i ? next : v)))
                  }
                />
              </div>
            ))}
          </div>
        </AdminCard>

        <div className="flex gap-2.5">
          <AdminButton className="h-10 px-[22px] text-[14px]" onClick={save}>
            Save settings
          </AdminButton>
        </div>
      </div>
    </div>
  );
}
