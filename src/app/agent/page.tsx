import type { Metadata } from "next";
import { AgentHome } from "@/components/agent/agent-home";

export const metadata: Metadata = {
  title: "My float",
  description: "Your float balance and recent movements.",
};

export default function AgentHomePage() {
  return <AgentHome />;
}
