"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useLogoutMutation } from "@/redux/auth/auth-api";
import { useCurrentUser } from "@/hooks/use-current-user";
import { notify } from "@/lib/notify";

/**
 * The field app's chrome: one slim top bar (brand, who is signed in, sign
 * out) over a narrow column. Deliberately light - agents work on slow rural
 * connections, so no sidebar, no heavy tables, no decoration that costs
 * bytes (design doc 8.6).
 */
export function AgentShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const user = useCurrentUser();
  const [logout, { isLoading }] = useLogoutMutation();

  const signOut = async () => {
    await logout()
      .unwrap()
      .catch(() => {});
    notify.success("Signed out");
    router.replace("/login");
  };

  return (
    <div className="min-h-screen bg-surface text-ink">
      <header className="border-b border-soil/25 bg-paper">
        <div className="mx-auto flex h-14 max-w-[560px] items-center justify-between px-4">
          <Link href="/agent" className="min-w-0">
            <span className="block text-[15px] font-bold tracking-tight text-forest">
              DB PLUS
            </span>
            <span className="block truncate text-[11px] text-soil">
              Field agent{user ? ` · ${user.firstName}` : ""}
            </span>
          </Link>
          <button
            type="button"
            onClick={() => void signOut()}
            disabled={isLoading}
            className="rounded border border-soil/35 px-3 py-1.5 text-[12.5px] font-medium text-soil transition-colors hover:bg-surface-alt"
          >
            Sign out
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-[560px] px-4 py-4">{children}</main>
    </div>
  );
}
