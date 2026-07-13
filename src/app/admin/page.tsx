import type { Metadata } from "next";
import { KpiCards } from "@/components/admin/dashboard/kpi-cards";
import { CashflowChart } from "@/components/admin/dashboard/cashflow-chart";
import { VolumeBars } from "@/components/admin/dashboard/volume-bars";
import { StockDonut } from "@/components/admin/dashboard/stock-donut";
import { ApprovalsWaiting } from "@/components/admin/dashboard/approvals-waiting";
import { TrucksOnRoad } from "@/components/admin/dashboard/trucks-on-road";
import { AgentFloats, StockByCommodity } from "@/components/admin/dashboard/side-panels";
import { ActivityFeed } from "@/components/admin/dashboard/activity-feed";

export const metadata: Metadata = { title: "Dashboard" };

/** The console home: KPI row, three chart cards, then the operations grid. */
export default function AdminDashboardPage() {
  return (
    <div>
      <div className="mb-[18px] flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold tracking-[-0.01em] text-ink">
            Good morning, Abdul
          </h1>
          <div className="mt-0.5 text-[13px] text-soil">Friday, 11 July 2026 · Tamale</div>
        </div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-soil/70">
          Updated 07:42
        </div>
      </div>

      <KpiCards />

      <div className="mb-5 grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 xl:grid-cols-[1.5fr_1.1fr_0.9fr]">
        <CashflowChart />
        <VolumeBars />
        <StockDonut />
      </div>

      <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 xl:grid-cols-[1.4fr_1.1fr_0.9fr]">
        <ApprovalsWaiting />
        <TrucksOnRoad />
        <div className="flex flex-col gap-4">
          <StockByCommodity />
          <AgentFloats />
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}
