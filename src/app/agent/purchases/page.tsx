import type { Metadata } from "next";
import Link from "next/link";
import { AgentPurchasesList } from "@/components/agent/agent-purchases-list";

export const metadata: Metadata = {
  title: "My purchases",
  description: "Purchases you have recorded against your float.",
};

export default function AgentPurchasesPage() {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-[18px] font-bold text-ink">My purchases</h1>
        <Link
          href="/agent/purchases/new"
          className="rounded bg-forest px-3 py-1.5 text-[13px] font-semibold text-paper"
        >
          + Record
        </Link>
      </div>
      <AgentPurchasesList />
    </div>
  );
}
