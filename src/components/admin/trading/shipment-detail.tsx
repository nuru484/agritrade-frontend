"use client";

import { useState } from "react";
import Link from "next/link";
import { AdminButton, AdminCard, Mono } from "@/components/admin/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { notify } from "@/lib/notify";
import { cn } from "@/lib/utils";
import { formatCedis } from "@/lib/format-money";
import {
  SHIPMENT_STEPS,
  type ShipmentDetail as ShipmentDetailPayload,
} from "@/static-data/admin/trading";
import { ActivityTimeline, BackLink, MetaList, SectionLabel, StatusChip } from "./bits";
import { ConsoleDialog, ConsoleDialogBanner, ConsoleDialogFooter } from "./console-dialog";

/** Lot statement header cell — pinned to the console's exact grid sizes. */
const lotHeadClass = "h-8 py-0 text-[10px] font-bold uppercase tracking-[0.09em] text-slate-500";

function Stepper({ currentStep }: { currentStep: number }) {
  return (
    <div className="mt-5 flex items-start overflow-x-auto border-t border-slate-100 pt-4">
      {SHIPMENT_STEPS.map((label, i) => {
        const done = i < currentStep;
        const current = i === currentStep;
        const hasLine = i < SHIPMENT_STEPS.length - 1;
        return (
          <div key={label} className={cn("flex min-w-0 items-start", hasLine ? "flex-1" : "flex-none")}>
            <div className="flex min-w-[62px] flex-col items-center gap-[5px]">
              <span
                className="flex h-[22px] w-[22px] items-center justify-center rounded-full text-[11px] font-bold"
                style={{
                  background: done ? "#1E3D2B" : current ? "#F7EED8" : "#FFFFFF",
                  color: done ? "#FFFFFF" : current ? "#7A5407" : "#9ba6b3",
                  border: `1.5px solid ${done ? "#1E3D2B" : current ? "#B8860B" : "#D6DBE2"}`,
                }}
              >
                {done ? "✓" : i + 1}
              </span>
              <span
                className="whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.07em]"
                style={{ color: done ? "#1E3D2B" : current ? "#7A5407" : "#9ba6b3" }}
              >
                {label}
              </span>
            </div>
            {hasLine ? (
              <div
                className="mt-2.5 h-0.5 min-w-4 flex-1"
                style={{ background: i < currentStep ? "#1E3D2B" : "#E2E5EA" }}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export function ShipmentDetail({ detail }: { detail: ShipmentDetailPayload }) {
  const { row } = detail;
  const [warnOpen, setWarnOpen] = useState(false);
  const [awaiting, setAwaiting] = useState(false);

  const gate = detail.dispatchGate;
  const canDispatch = detail.currentStep === 1;

  const tryDispatch = () => {
    if (gate && gate.paidCedis < gate.requiredCedis) setWarnOpen(true);
    else notify.success(`Truck for ${row.ref} dispatched`);
  };

  const requestApproval = () => {
    setWarnOpen(false);
    setAwaiting(true);
    notify.info("Sent for approval — truck stays until approved");
  };

  return (
    <div>
      <BackLink href="/admin/shipments">Shipments</BackLink>

      <AdminCard className="mb-4 rounded-[8px] px-5 py-[18px]">
        <div className="flex flex-wrap items-start justify-between gap-3.5">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-[20px] font-bold tracking-[-0.01em] text-slate-900">
                Shipment <Mono>{row.ref}</Mono> — {row.route}
              </h1>
              <StatusChip tone={row.tone}>{row.status}</StatusChip>
              {awaiting ? <StatusChip tone="harvest">Awaiting approval</StatusChip> : null}
            </div>
            <div className="mt-1 text-[12.5px] text-slate-500">
              {detail.saleRef ? (
                <>
                  For Sale{" "}
                  <Link href={`/admin/sales/${detail.saleRef}`} className="font-adminmono font-semibold text-console hover:underline">
                    {detail.saleRef}
                  </Link>{" "}
                  · {detail.buyer} ·{" "}
                </>
              ) : (
                <>Internal transfer · </>
              )}
              Truck {detail.truck} · Driver: {detail.driver}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {canDispatch ? (
              <AdminButton className="h-[34px]" onClick={tryDispatch}>
                Dispatch truck
              </AdminButton>
            ) : null}
            <AdminButton
              variant="secondary"
              className="h-[34px]"
              onClick={() => notify.info(`Waybill for ${row.ref} sent to print`)}
            >
              Print waybill
            </AdminButton>
          </div>
        </div>
        <Stepper currentStep={detail.currentStep} />
      </AdminCard>

      <div className="grid items-start gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="flex min-w-0 flex-col gap-4">
          {detail.estimatedLotRef ? (
            <div className="flex items-start gap-2.5 rounded-[8px] border border-[#EAD9AE] bg-[#F7EED8] px-3.5 py-3 text-[13px] text-[#7A5407]">
              <span className="font-bold">⚠</span>
              <span>
                Cost basis for lot <Mono className="font-bold">{detail.estimatedLotRef}</Mono> is{" "}
                <strong>estimated</strong> — lots were not selected at loading. Figures marked with ~ will settle when
                receipts are matched.
              </span>
            </div>
          ) : null}

          {/* Lot allocation */}
          <AdminCard className="overflow-hidden rounded-[8px]">
            <div className="border-b border-slate-100 px-5 py-3">
              <SectionLabel>Lot allocation</SectionLabel>
            </div>
            <Table className="table-fixed text-[13px]">
              <TableHeader>
                <TableRow className="border-slate-200 bg-slate-50 hover:bg-slate-50">
                  <TableHead className={cn(lotHeadClass, "w-[112px] pl-5 pr-1.5 xl:w-[118px]")}>Lot</TableHead>
                  <TableHead className={cn(lotHeadClass, "hidden px-1.5 xl:table-cell xl:w-[102px]")}>
                    Origin purchase
                  </TableHead>
                  <TableHead className={cn(lotHeadClass, "w-[92px] px-1.5 text-right xl:w-[102px]")}>
                    Loaded
                  </TableHead>
                  <TableHead className={cn(lotHeadClass, "w-[142px] px-1.5 text-right")}>Origin cost</TableHead>
                  <TableHead className={cn(lotHeadClass, "w-[116px] pl-1.5 pr-5 xl:w-[126px]")}>Basis</TableHead>
                  <TableHead aria-hidden="true" className={cn(lotHeadClass, "p-0")} />
                </TableRow>
              </TableHeader>
              <TableBody className="[&_tr:last-child]:border-b">
                {detail.lots.map((lot) => (
                  <TableRow key={lot.ref} className="h-[42px] border-slate-100 hover:bg-transparent">
                    <TableCell className="py-0 pl-5 pr-1.5">
                      <Mono className="text-[12.5px] font-semibold text-slate-800">{lot.ref}</Mono>
                    </TableCell>
                    <TableCell className="hidden px-1.5 py-0 xl:table-cell">
                      <Mono className="text-[12.5px] text-slate-600">{lot.origin}</Mono>
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-1.5 py-0 text-right">
                      <Mono className="text-slate-800">{lot.loaded}</Mono>
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-1.5 py-0 text-right">
                      <Mono className={cn("font-semibold", lot.estimated ? "text-[#7A5407]" : "text-slate-900")}>
                        {lot.cost}
                      </Mono>
                    </TableCell>
                    <TableCell className="py-0 pl-1.5 pr-5">
                      <span
                        className={cn(
                          "inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.08em]",
                          lot.estimated
                            ? "border border-console-gold text-[#7A5407]"
                            : "border border-transparent bg-[#E6F0E9] text-[#2F5E3D]",
                        )}
                      >
                        {lot.estimated ? "Estimated" : "Actual"}
                      </span>
                    </TableCell>
                    <TableCell aria-hidden="true" className="p-0" />
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex justify-between bg-slate-50/60 px-5 py-[11px] text-[13px]">
              <span className="font-semibold text-slate-700">Total loaded</span>
              <Mono className="font-bold">
                {detail.totalLoadedKg.toLocaleString("en-GH")} kg · {detail.totalLoadedCost}
              </Mono>
            </div>
          </AdminCard>
        </div>

        <div className="flex flex-col gap-4">
          <AdminCard className="rounded-[8px] px-[18px] py-3.5">
            <SectionLabel className="mb-2.5">Load photos</SectionLabel>
            <div className="grid grid-cols-2 gap-2">
              {detail.photoSlots.map((label, i) => (
                <div
                  key={label}
                  className={cn(
                    "flex h-24 items-center justify-center rounded-[6px] border border-dashed border-slate-200 bg-slate-50 px-2 text-center text-[11.5px] text-slate-400",
                    i === 2 ? "col-span-full" : detail.photoSlots.length === 1 ? "col-span-full" : undefined,
                  )}
                >
                  {label}
                </div>
              ))}
            </div>
            <div className="mt-2 text-[11.5px] text-slate-500">
              Photos are captured by the agent at loading and attach to the waybill.
            </div>
          </AdminCard>
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

      {/* Warn-then-approve dialog */}
      {gate ? (
        <ConsoleDialog open={warnOpen} onOpenChange={setWarnOpen} widthClass="max-w-[460px] sm:max-w-[460px]">
          <ConsoleDialogBanner variant="warn" icon="⚠">
            Payment milestone not met
          </ConsoleDialogBanner>
          <div className="px-5 py-[18px]">
            <div className="text-[14px] leading-[1.55] text-slate-800">
              Dispatching {row.ref} requires <strong>{gate.requiredPct}% payment</strong> on Sale {gate.saleRef}.
            </div>
            <div className="mt-3 rounded-[8px] border border-slate-200 bg-slate-50 px-3.5 py-3">
              <div className="flex justify-between py-[3px] text-[13px]">
                <span className="text-slate-500">Paid so far</span>
                <Mono className="font-semibold">{formatCedis(gate.paidCedis)}</Mono>
              </div>
              <div className="flex justify-between py-[3px] text-[13px]">
                <span className="text-slate-500">Required ({gate.requiredPct}%)</span>
                <Mono className="font-semibold">{formatCedis(gate.requiredCedis)}</Mono>
              </div>
              <div className="mt-1 flex justify-between border-t border-slate-200 pb-[3px] pt-[7px] text-[13px]">
                <span className="font-semibold text-[#7A5407]">Shortfall</span>
                <Mono className="font-bold text-[#7A5407]">{formatCedis(gate.requiredCedis - gate.paidCedis)}</Mono>
              </div>
            </div>
            <div className="mt-3 text-[13px] text-slate-500">
              Proceeding sends this dispatch to the owner for approval. The truck stays at the warehouse until it is
              approved.
            </div>
          </div>
          <ConsoleDialogFooter>
            <AdminButton variant="secondary" className="h-[38px]" onClick={() => setWarnOpen(false)}>
              Go back
            </AdminButton>
            <AdminButton variant="gold" className="h-[38px]" onClick={requestApproval}>
              Request approval &amp; proceed
            </AdminButton>
          </ConsoleDialogFooter>
        </ConsoleDialog>
      ) : null}
    </div>
  );
}
