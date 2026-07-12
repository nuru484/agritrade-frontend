"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminButton, AdminCard, Mono } from "@/components/admin/ui";
import { notify } from "@/lib/notify";
import { cn } from "@/lib/utils";
import { formatCedis, formatKg } from "@/lib/format-money";
import {
  type PurchaseDetail as PurchaseDetailPayload,
  type PurchaseStatus,
} from "@/static-data/admin/trading";
import { ActivityTimeline, BackLink, HeaderFigure, LedgerTable, MetaList, SectionLabel, StatusChip } from "./bits";
import { VoidPurchaseDialog } from "./void-purchase-dialog";
import type { Tone } from "@/components/admin/ui";

export function PurchaseDetail({ detail }: { detail: PurchaseDetailPayload }) {
  const router = useRouter();
  const [status, setStatus] = useState<{ status: PurchaseStatus; tone: Tone }>({
    status: detail.row.status,
    tone: detail.row.tone,
  });
  const [voidOpen, setVoidOpen] = useState(false);

  const row = { ...detail.row, ...status };
  const voided = row.status === "Voided";
  const canReceive = !voided && (row.status === "Recorded" || row.status === "In transit");

  const markReceived = () => {
    setStatus({ status: "Received", tone: "leaf" });
    notify.success(`Purchase ${row.ref} marked received`);
  };

  return (
    <div>
      <BackLink href="/admin/purchases">Purchases</BackLink>

      <AdminCard className="mb-4 rounded-[8px] px-5 py-[18px]">
        <div className="flex flex-wrap items-start justify-between gap-3.5">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-[20px] font-bold tracking-[-0.01em] text-slate-900">
                Purchase <Mono>{row.ref}</Mono> — {row.supplier}
              </h1>
              <StatusChip tone={row.tone}>{row.status}</StatusChip>
            </div>
            <div className="mt-1 text-[12.5px] text-slate-500">
              {row.commodity} · bought by {row.agent} · {row.date}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {canReceive ? (
              <AdminButton className="h-[34px]" onClick={markReceived}>
                Mark received
              </AdminButton>
            ) : null}
            <AdminButton
              variant="secondary"
              className="h-[34px]"
              onClick={() => router.push(`/admin/purchases/new?edit=${row.ref}`)}
            >
              Edit
            </AdminButton>
            <AdminButton
              variant="secondary"
              className="h-[34px]"
              onClick={() => notify.info(`Goods-received note for ${row.ref} sent to print`)}
            >
              Print GRN
            </AdminButton>
            {!voided ? (
              <AdminButton
                variant="secondary"
                className="h-[34px] border-[#E5C4BF] text-console-red hover:bg-[#FBF3F2]"
                onClick={() => setVoidOpen(true)}
              >
                Void
              </AdminButton>
            ) : null}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 md:grid-cols-[repeat(auto-fit,minmax(140px,1fr))] xl:grid-cols-[repeat(4,max-content)]">
          <HeaderFigure label="Weight">{formatKg(row.weightKg)}</HeaderFigure>
          <HeaderFigure label="Price/kg">{formatCedis(row.pricePerKg)}</HeaderFigure>
          <HeaderFigure label="Total paid" className={voided ? "line-through" : undefined}>
            {formatCedis(detail.totalCedis)}
          </HeaderFigure>
          <HeaderFigure label="Paid from" mono={false}>
            {row.agent}&apos;s float
          </HeaderFigure>
        </div>
      </AdminCard>

      <div className="grid items-start gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="flex min-w-0 flex-col gap-4">
          <AdminCard className="overflow-hidden rounded-[8px]">
            <div className="border-b border-slate-100 px-5 py-3">
              <SectionLabel>Float movement</SectionLabel>
            </div>
            <LedgerTable rows={detail.ledger} afterLabel="Float after" />
          </AdminCard>
          <AdminCard className="rounded-[8px] px-5 py-3.5">
            <SectionLabel className="mb-2">Notes</SectionLabel>
            <div className="text-[13.5px] text-slate-600">{detail.notes}</div>
          </AdminCard>
        </div>
        <div className="flex flex-col gap-4">
          <AdminCard className="rounded-[8px] px-[18px] py-3.5">
            <SectionLabel className="mb-2.5">Details</SectionLabel>
            <MetaList items={detail.meta} />
          </AdminCard>
          <AdminCard className={cn("rounded-[8px] px-[18px] py-3.5")}>
            <SectionLabel className="mb-3">Activity</SectionLabel>
            <ActivityTimeline items={detail.timeline} />
          </AdminCard>
        </div>
      </div>

      <VoidPurchaseDialog
        purchase={voidOpen ? row : null}
        onOpenChange={(open) => {
          if (!open) setVoidOpen(false);
        }}
        onConfirm={(purchase) => {
          setStatus({ status: "Voided", tone: "slate" });
          setVoidOpen(false);
          notify.success(`Purchase ${purchase.ref} voided — float reversed`);
        }}
      />
    </div>
  );
}
