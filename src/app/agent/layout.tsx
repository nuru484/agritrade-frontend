import type { Metadata } from "next";
import { AgentShell } from "@/components/agent/agent-shell";
import { RequireAuth } from "@/components/auth/require-auth";
import { RequireRole } from "@/components/auth/require-role";
import { UserRole } from "@/types/user.types";

export const metadata: Metadata = {
  title: {
    default: "Field · DB Plus",
    template: "%s · DB Plus Field",
  },
  robots: { index: false, follow: false },
};

/**
 * The field agent surface: RequireAuth validates the session, RequireRole
 * keeps it agent-only (office roles are routed back to the console), and the
 * shell stays deliberately light for slow rural networks.
 */
export default function AgentLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen text-[14px] leading-[1.5] antialiased">
      <RequireAuth>
        <RequireRole allow={[UserRole.AGENT]} redirectTo="/admin">
          <AgentShell>{children}</AgentShell>
        </RequireRole>
      </RequireAuth>
    </div>
  );
}
