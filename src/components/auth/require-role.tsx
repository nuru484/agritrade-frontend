"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { useAuthRole } from "@/hooks/use-auth-role";
import { UserRole } from "@/types/user.types";

/**
 * Role fence INSIDE RequireAuth: the session is already validated; this only
 * routes each role to its own surface. Field agents live in /agent (the
 * backend refuses them everywhere else anyway); everyone else lives in
 * /admin. The fence redirects rather than erroring - landing in the wrong
 * namespace is a navigation mistake, not a violation.
 */
export function RequireRole({
  allow,
  redirectTo,
  children,
}: {
  allow: UserRole[];
  redirectTo: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const { role } = useAuthRole();
  const allowed = role !== null && allow.includes(role);

  useEffect(() => {
    if (role !== null && !allowed) router.replace(redirectTo);
  }, [role, allowed, redirectTo, router]);

  // Role still unknown (auth store hydrating) or redirect in flight.
  if (!allowed) return <LoadingScreen />;
  return <>{children}</>;
}
