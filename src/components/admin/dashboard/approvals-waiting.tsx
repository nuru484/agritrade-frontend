import Link from "next/link";
import { AdminCard, Mono, ToneBadge } from "@/components/admin/ui";
import { APPROVALS_PREVIEW } from "@/static-data/admin/dashboard";
import { ADMIN_HOME } from "@/static-data/admin/nav";

const APPROVALS_HREF = `${ADMIN_HOME}/approvals`;

/** Approvals waiting — first four pending requests, all linking to the inbox. */
export function ApprovalsWaiting() {
  return (
    <AdminCard className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-soil/15 px-4 py-3">
        <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-soil">
          Approvals waiting
        </div>
        <Link
          href={APPROVALS_HREF}
          className="whitespace-nowrap text-[12.5px] font-semibold text-console hover:underline"
        >
          View all →
        </Link>
      </div>
      {APPROVALS_PREVIEW.map((a) => (
        <Link
          key={a.summary}
          href={APPROVALS_HREF}
          className="block border-b border-soil/15 px-4 py-[11px] last:border-b-0 hover:bg-surface-alt/70"
        >
          <div className="mb-[5px] flex items-center justify-between gap-2.5">
            <ToneBadge
              tone={a.tone}
              className="px-[9px] py-[3px] text-[10px] font-bold uppercase tracking-[0.08em]"
            >
              {a.kind}
            </ToneBadge>
            <Mono className="whitespace-nowrap text-[13px] font-semibold text-ink">
              {a.amount}
            </Mono>
          </div>
          <div className="overflow-hidden text-ellipsis whitespace-nowrap text-[13px] text-ink">
            {a.summary}
          </div>
          <div className="text-[11.5px] text-soil">{a.who}</div>
        </Link>
      ))}
    </AdminCard>
  );
}
