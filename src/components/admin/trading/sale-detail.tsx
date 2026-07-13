"use client";

import { useState } from "react";
import Link from "next/link";
import { AdminButton, AdminCard, Mono, adminSelectClass } from "@/components/admin/ui";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { notify } from "@/lib/notify";
import { cn } from "@/lib/utils";
import { formatCedis } from "@/lib/format-money";
import {
  formatCedisWhole,
  type LedgerRow,
  type SaleDetail as SaleDetailPayload,
} from "@/static-data/admin/trading";
import { ActivityTimeline, BackLink, HeaderFigure, LedgerTable, MetaList, SectionLabel, StatusChip } from "./bits";
import { ConsoleDialog, ConsoleDialogFooter, ConsoleDialogTitle } from "./console-dialog";

const PAY_METHODS = ["Bank transfer", "Mobile money", "Cash", "Cheque"];

/** Console 38px select skin on the shadcn SelectTrigger (data-size beats plain h-*). */
const paySelectTriggerClass = cn(adminSelectClass, "justify-between data-[size=default]:h-[42px]");

export function SaleDetail({
  detail,
  initialPayOpen = false,
}: {
  detail: SaleDetailPayload;
  initialPayOpen?: boolean;
}) {
  const { row } = detail;
  const [paid, setPaid] = useState(row.paidCedis);
  const [payments, setPayments] = useState<LedgerRow[]>(detail.payments);
  const [payOpen, setPayOpen] = useState(initialPayOpen);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState(PAY_METHODS[0]);

  const balance = row.agreedCedis - paid;
  const dispatchMilestone = detail.milestones.find((m) => m.pct === detail.dispatchPct);
  const dispatchShort = dispatchMilestone ? paid < dispatchMilestone.amountCedis : false;
  const progressPct = Math.min((paid / row.agreedCedis) * 100, 100);

  const confirmPayment = () => {
    const amount = parseFloat(payAmount.replace(/,/g, ""));
    if (Number.isFinite(amount) && amount > 0) {
      const newPaid = paid + amount;
      setPaid(newPaid);
      setPayments((rows) => [
        ...rows,
        {
          date: "11 Jul 2026",
          desc: `${payMethod} — recorded manually`,
          amount: `+${formatCedis(amount)}`,
          direction: "credit",
          after: formatCedis(newPaid),
        },
      ]);
    }
    setPayOpen(false);
    notify.success(`Payment of GH₵ ${payAmount || "0.00"} recorded on ${row.ref}`);
    setPayAmount("");
  };

  return (
    <div>
      <BackLink href="/admin/sales">Sales</BackLink>

      <AdminCard className="mb-4 rounded-[8px] px-5 py-[18px]">
        <div className="flex flex-wrap items-start justify-between gap-3.5">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-[20px] font-bold tracking-[-0.01em] text-ink">
                Sale <Mono>{row.ref}</Mono> — {row.buyer}
              </h1>
              <StatusChip tone={row.tone}>{row.status}</StatusChip>
            </div>
            <div className="mt-1 text-[12.5px] text-soil">{detail.subline}</div>
          </div>
          <div className="flex flex-wrap gap-2">
            <AdminButton
              className="h-[34px]"
              onClick={() => notify.info(`Payment link sent to ${row.buyer} — expires in 48h`)}
            >
              Send payment link
            </AdminButton>
            <AdminButton variant="secondary" className="h-[34px]" onClick={() => setPayOpen(true)}>
              Record payment
            </AdminButton>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-soil/15 pt-4 md:grid-cols-[repeat(auto-fit,minmax(140px,1fr))] xl:grid-cols-[repeat(4,max-content)]">
          <HeaderFigure label="Agreed">{formatCedis(row.agreedCedis)}</HeaderFigure>
          <HeaderFigure label="Paid" className="text-[#2F5E3D]">
            {formatCedis(paid)}
          </HeaderFigure>
          <HeaderFigure label="Balance due" className="text-console-red">
            {formatCedis(balance)}
          </HeaderFigure>
          <HeaderFigure label="Fulfilled">
            {detail.fulfilledKg.toLocaleString("en-GH")} / {detail.totalKg.toLocaleString("en-GH")} kg
          </HeaderFigure>
        </div>
      </AdminCard>

      <div className="grid items-start gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="flex min-w-0 flex-col gap-4">
          {/* Milestones */}
          <AdminCard className="rounded-[8px] px-5 py-4">
            <SectionLabel className="mb-3">Payment milestones</SectionLabel>
            <div className="relative mx-0 mb-2 mt-[18px] h-2.5 rounded-full bg-soil/10">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-[#3E7A50]"
                style={{ width: `${progressPct}%` }}
              />
              {detail.milestones.map((m) => (
                <div
                  key={m.pct}
                  className="absolute -top-[5px] h-5 w-0.5"
                  style={{ left: `${m.pct}%`, background: paid >= m.amountCedis ? "#3E7A50" : "#C9CFD8" }}
                />
              ))}
            </div>
            <div className="relative h-[34px]">
              {detail.milestones.map((m, i) => {
                const last = i === detail.milestones.length - 1;
                const met = paid >= m.amountCedis;
                return (
                  <div
                    key={m.pct}
                    className={cn("absolute", last ? "-translate-x-full text-right" : "-translate-x-1/2 text-center")}
                    style={{ left: `${m.pct}%` }}
                  >
                    <div
                      className="whitespace-nowrap text-[10.5px] font-bold uppercase tracking-[0.07em]"
                      style={{ color: met ? "#2F5E3D" : "#6a7686" }}
                    >
                      {m.label}
                    </div>
                    <Mono className="whitespace-nowrap text-[11.5px] text-soil">
                      {formatCedisWhole(m.amountCedis)}
                    </Mono>
                  </div>
                );
              })}
            </div>
            {dispatchMilestone && dispatchShort ? (
              <div className="mt-2 flex items-center gap-2 rounded-[6px] bg-[#F7EED8] px-3 py-2.5 text-[13px] text-[#7A5407]">
                <span className="font-bold">⚠</span>
                <span>
                  Paid <Mono className="font-bold">{formatCedisWhole(paid)}</Mono> of the{" "}
                  <Mono className="font-bold">{formatCedisWhole(dispatchMilestone.amountCedis)}</Mono> (
                  {detail.dispatchPct}%) required before dispatch.
                </span>
              </div>
            ) : null}
          </AdminCard>

          {/* Payments ledger */}
          <AdminCard className="overflow-hidden rounded-[8px]">
            <div className="flex items-center justify-between border-b border-soil/15 px-5 py-3">
              <SectionLabel>Payments</SectionLabel>
              <AdminButton
                variant="ghost"
                onClick={() => setPayOpen(true)}
                className="h-auto cursor-pointer rounded-none p-0 text-[12.5px] font-semibold text-console hover:bg-transparent hover:text-console hover:underline"
              >
                + Record payment
              </AdminButton>
            </div>
            <LedgerTable rows={payments} afterLabel="Balance after" />
          </AdminCard>

          {/* Shipments on this sale */}
          {detail.shipments.length > 0 ? (
            <AdminCard className="overflow-hidden rounded-[8px]">
              <div className="border-b border-soil/15 px-5 py-3">
                <SectionLabel>Shipments</SectionLabel>
              </div>
              {detail.shipments.map((sh) => (
                <Link
                  key={sh.ref}
                  href={`/admin/shipments/${sh.ref}`}
                  className="flex items-center justify-between gap-3 px-5 py-[13px] hover:bg-surface-alt/50"
                >
                  <div>
                    <Mono className="text-[13px] font-semibold text-console">{sh.ref}</Mono>
                    <span className="ml-2.5 text-[13px] text-soil">{sh.desc}</span>
                  </div>
                  <StatusChip tone={sh.tone}>{sh.status}</StatusChip>
                </Link>
              ))}
            </AdminCard>
          ) : null}
        </div>

        {/* Right rail */}
        <div className="flex flex-col gap-4">
          <AdminCard className="rounded-[8px] px-[18px] py-3.5">
            <SectionLabel className="mb-2.5">Details</SectionLabel>
            <MetaList items={detail.meta} />
          </AdminCard>
          <AdminCard className="rounded-[8px] px-[18px] py-3.5">
            <SectionLabel className="mb-3">Activity</SectionLabel>
            <ActivityTimeline items={detail.timeline} />
          </AdminCard>
        </div>
      </div>

      {/* Record payment modal */}
      <ConsoleDialog open={payOpen} onOpenChange={setPayOpen}>
        <div className="px-5 pt-4">
          <ConsoleDialogTitle className="text-[16px] font-bold text-ink">Record payment</ConsoleDialogTitle>
          <div className="mt-0.5 text-[12.5px] text-soil">
            Sale {row.ref} · {row.buyer} · balance {formatCedis(balance)}
          </div>
        </div>
        <div className="flex flex-col gap-[13px] px-5 py-4">
          <label className="block">
            <span className="mb-[5px] block text-[13px] font-semibold text-soil">Amount</span>
            <div className="flex h-[38px] items-center overflow-hidden rounded-[6px] border border-soil/35 bg-paper focus-within:border-console">
              <span className="flex h-full items-center border-r border-soil/25 bg-surface-alt/70 px-2.5 text-[13px] text-soil">
                GH₵
              </span>
              <Input
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                placeholder="0.00"
                inputMode="decimal"
                className="h-full min-w-0 flex-1 rounded-none border-0 bg-transparent px-2.5 py-0 text-right font-adminmono text-[14px] tabular-nums text-ink shadow-none outline-none placeholder:text-soil/70 focus-visible:ring-0 dark:bg-transparent"
              />
            </div>
          </label>
          <label className="block">
            <span className="mb-[5px] block text-[13px] font-semibold text-soil">Method</span>
            <Select value={payMethod} onValueChange={setPayMethod}>
              <SelectTrigger className={paySelectTriggerClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAY_METHODS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <label className="block">
            <span className="mb-[5px] block text-[13px] font-semibold text-soil">
              Reference <span className="font-normal text-soil/70">(optional)</span>
            </span>
            <Input
              placeholder="e.g. GCB-88214"
              className="h-[38px] w-full rounded-[6px] border-soil/35 bg-paper px-2.5 text-[14px] text-ink shadow-none outline-none placeholder:text-soil/70 focus:border-console focus-visible:border-console focus-visible:ring-0 dark:bg-paper"
            />
          </label>
        </div>
        <ConsoleDialogFooter>
          <AdminButton variant="secondary" onClick={() => setPayOpen(false)}>
            Cancel
          </AdminButton>
          <AdminButton onClick={confirmPayment}>Record payment</AdminButton>
        </ConsoleDialogFooter>
      </ConsoleDialog>
    </div>
  );
}
