import type { Metadata } from "next";
import { AgentsTable } from "@/components/admin/agents/agents-table";

export const metadata: Metadata = {
  title: "Agents & Floats",
  description: "Field buyers and the cash floats in their hands.",
};

export default function AgentsPage() {
  return <AgentsTable />;
}
