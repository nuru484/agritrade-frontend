import type { Metadata } from "next";
import { AgentDetail } from "@/components/admin/agents/agent-detail";

export const metadata: Metadata = {
  title: "Agent",
  description: "One agent's float ledger, top-ups and reconciliations.",
};

export default async function AgentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AgentDetail agentUserId={id} />;
}
