"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminButton, AdminCard, AdminPageHeader, Mono, TONES } from "@/components/admin/ui";
import { approvalRequests, type ApprovalRequest } from "@/static-data/admin/inbox";
import { notify } from "@/lib/notify";
import { cn } from "@/lib/utils";

type InboxTab = "history" | "pending";

/** Uppercase micro-chip used for request kinds and history decisions. */
function KindChip({
  fg,
  bg,
  dot,
  children,
}: {
  fg: string;
  bg: string;
  dot?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className="inline-flex items-center gap-[5px] rounded-full px-[9px] py-[3px] text-[10px] font-bold tracking-[0.08em] uppercase"
      style={{ color: fg, background: bg }}
    >
      {dot ? (
        <span aria-hidden="true" className="h-[5px] w-[5px] rounded-full" style={{ background: dot }} />
      ) : null}
      {children}
    </span>
  );
}

/** shadcn TabsTrigger restyled as the console's underline tab. */
const tabTriggerClass =
  "-mb-px h-auto flex-none cursor-pointer rounded-none border-0 border-b-2 border-transparent px-3.5 py-2 text-[13.5px] font-semibold whitespace-nowrap text-slate-500 after:hidden hover:text-slate-500 data-active:border-console data-active:text-console data-active:hover:text-console";

export function ApprovalsScreen() {
  const [tab, setTab] = useState<InboxTab>("pending");
  const [requests, setRequests] = useState<ApprovalRequest[]>(approvalRequests);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectNote, setRejectNote] = useState("");

  const pending = requests.filter((r) => r.status === "pending");
  const history = requests.filter((r) => r.status !== "pending");

  const approve = (req: ApprovalRequest) => {
    setRequests((rs) => rs.map((r) => (r.id === req.id ? { ...r, status: "approved" } : r)));
    setRejectingId(null);
    notify.success(`Approved — ${req.kind.toLowerCase()}`);
  };

  const confirmReject = (req: ApprovalRequest) => {
    const note = rejectNote.trim();
    if (!note) return;
    setRequests((rs) => rs.map((r) => (r.id === req.id ? { ...r, status: "rejected", note } : r)));
    setRejectingId(null);
    setRejectNote("");
  };

  return (
    <div className="max-w-[720px]">
      <AdminPageHeader title="Approvals" sub="Requests that need your decision" />

      <Tabs value={tab} onValueChange={(v) => setTab(v as InboxTab)} className="gap-0">
        <TabsList
          variant="line"
          className="group-data-horizontal/tabs:h-auto mb-4 flex h-auto w-full items-center justify-start rounded-none border-b border-slate-200 p-0"
        >
          <TabsTrigger value="pending" className={tabTriggerClass}>
            Pending ({pending.length})
          </TabsTrigger>
          <TabsTrigger value="history" className={tabTriggerClass}>
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="flex flex-col gap-3">
          {pending.length === 0 ? (
            <AdminCard className="px-5 py-10 text-center text-[14px] text-slate-500">
              All caught up — nothing waiting for approval.
            </AdminCard>
          ) : null}
          {pending.map((req) => {
            const tone = TONES[req.tone];
            const isRejecting = rejectingId === req.id;
            return (
              <AdminCard key={req.id} className="p-4">
                <div className="mb-2 flex flex-wrap items-center gap-2.5">
                  <KindChip fg={tone.fg} bg={tone.bg} dot={tone.dot}>
                    {req.kind}
                  </KindChip>
                  <span className="text-[12px] text-slate-500">
                    {req.who} · {req.when}
                  </span>
                </div>
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <div className="min-w-[200px] flex-1 text-[14px] text-slate-800">{req.summary}</div>
                  <Mono className="whitespace-nowrap text-[20px] font-bold text-slate-900">
                    {req.amount}
                  </Mono>
                </div>
                <div className="mt-1 text-[13px] text-slate-500">{req.context}</div>

                {isRejecting ? (
                  <div className="mt-3">
                    <Input
                      autoFocus
                      value={rejectNote}
                      onChange={(e) => setRejectNote(e.target.value)}
                      placeholder="Reason for rejection (required)"
                      className="h-9 w-full rounded-[6px] border-console-red bg-white px-2.5 text-[13.5px] text-slate-900 outline-none placeholder:text-slate-400 focus-visible:border-console-red focus-visible:ring-0 md:text-[13.5px]"
                    />
                    <div className="mt-2 flex gap-2">
                      <AdminButton
                        variant="danger"
                        onClick={() => confirmReject(req)}
                        className={cn(
                          "h-[34px] cursor-pointer px-3.5 text-[13px] hover:bg-console-red",
                          !rejectNote.trim() && "opacity-50",
                        )}
                      >
                        Confirm rejection
                      </AdminButton>
                      <AdminButton
                        variant="secondary"
                        onClick={() => setRejectingId(null)}
                        className="h-[34px] cursor-pointer px-3.5 text-[13px]"
                      >
                        Cancel
                      </AdminButton>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3.5 flex gap-2">
                    <AdminButton
                      onClick={() => approve(req)}
                      className="h-[38px] flex-1 cursor-pointer px-[18px] sm:flex-none"
                    >
                      Approve
                    </AdminButton>
                    <AdminButton
                      variant="secondary"
                      onClick={() => {
                        setRejectingId(req.id);
                        setRejectNote("");
                      }}
                      className="h-[38px] flex-1 cursor-pointer border-[#E5C4BF] px-[18px] text-console-red hover:bg-[#FBF3F2] hover:text-console-red sm:flex-none"
                    >
                      Reject…
                    </AdminButton>
                  </div>
                )}
              </AdminCard>
            );
          })}
        </TabsContent>

        <TabsContent value="history">
          <AdminCard className="overflow-hidden rounded-lg">
            {history.length === 0 ? (
              <div className="px-5 py-10 text-center text-[14px] text-slate-500">
                No decisions yet today.
              </div>
            ) : null}
            {history.map((req) => {
              const approved = req.status === "approved";
              return (
                <div
                  key={req.id}
                  className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0"
                >
                  <KindChip
                    fg={approved ? TONES.leaf.fg : TONES.alert.fg}
                    bg={approved ? TONES.leaf.bg : TONES.alert.bg}
                  >
                    {approved ? "Approved" : "Rejected"}
                  </KindChip>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] text-slate-800">{req.summary}</div>
                    <div className="text-[11.5px] text-slate-500">
                      {req.who}
                      {req.note ? ` · “${req.note}”` : ""}
                    </div>
                  </div>
                  <Mono className="text-[13px] font-semibold text-slate-700">{req.amount}</Mono>
                </div>
              );
            })}
          </AdminCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
