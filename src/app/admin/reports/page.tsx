import type { Metadata } from "next";
import { AdminButton, AdminPageHeader } from "@/components/admin/ui";
import { ReportKpis } from "@/components/admin/reports/report-kpis";
import { ProfitTrend } from "@/components/admin/reports/profit-trend";
import { CommodityBars } from "@/components/admin/reports/commodity-bars";
import { PlStatement } from "@/components/admin/reports/pl-statement";
import { AgentPerformance } from "@/components/admin/reports/agent-performance";
import {
  ESTIMATE_NOTICE_AMOUNT,
  REPORT_FILTERS,
  REPORT_PERIOD_CHIP,
} from "@/static-data/admin/reports";

export const metadata: Metadata = { title: "Reports" };

/** Filter dropdown chip (static until the backend hookup). */
function FilterChip({ k, v }: { k: string; v: string }) {
  return (
    <AdminButton
      variant="secondary"
      className="h-8 cursor-pointer gap-1.5 border-slate-200 px-2.5 text-[13px] font-normal whitespace-nowrap text-slate-700 hover:border-slate-300 hover:bg-white hover:text-slate-700"
    >
      <span className="text-slate-400">{k}:</span>
      <span className="font-semibold">{v}</span>
      <svg className="size-[9px]" width="9" height="9" viewBox="0 0 10 10" fill="none" aria-hidden="true">
        <path
          d="M2 3.5 5 6.5 8 3.5"
          stroke="#6a7686"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </AdminButton>
  );
}

export default function AdminReportsPage() {
  return (
    <div>
      <AdminPageHeader
        title="Reports"
        sub="Profit & loss, margins and agent performance"
        actions={
          <>
            <AdminButton variant="secondary">Export CSV</AdminButton>
            <AdminButton variant="secondary">Export PDF</AdminButton>
            <AdminButton>Print</AdminButton>
          </>
        }
      />

      <div className="mb-3.5 flex flex-wrap items-center gap-2">
        {REPORT_FILTERS.map((f) => (
          <FilterChip key={f.k} k={f.k} v={f.v} />
        ))}
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-[#E7EEE9] px-[11px] py-[5px] text-[12px] font-semibold text-console">
          {REPORT_PERIOD_CHIP} <span className="cursor-pointer font-bold opacity-60">✕</span>
        </span>
      </div>

      <ReportKpis />

      <div className="mb-4 grid grid-cols-1 items-stretch gap-4 xl:grid-cols-[1.5fr_1fr]">
        <ProfitTrend />
        <CommodityBars />
      </div>

      <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-[#EAD9AE] bg-[#F7EED8] px-3.5 py-3 text-[13px] text-[#7A5407]">
        <span className="font-bold" aria-hidden="true">
          ⚠
        </span>
        <span>
          Cost of goods includes <strong>{ESTIMATE_NOTICE_AMOUNT}</strong> of estimated lot costs
          (marked ~). Margins will settle when receipts are matched at loading.
        </span>
      </div>

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[1.1fr_1fr]">
        <PlStatement />
        <AgentPerformance />
      </div>
    </div>
  );
}
