import type { Metadata } from "next";
import { UsersTable } from "@/components/admin/users/users-table";

export const metadata: Metadata = { title: "Users" };

/** The live Users register — this static route wins over the config-driven
 * `[register]` template, which is why the stub `users` entry was retired. */
export default function UsersPage() {
  return <UsersTable />;
}
