"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { useCurrentUser } from "@/hooks/use-current-user";
import { AuthCard } from "./auth-card";
import { LoginForm } from "./login-form";
import { TwoFactorForm } from "./two-factor-form";

// Hydration-safe "are we on the client yet" (see require-auth.tsx).
const emptySubscribe = () => () => {};
const useHydrated = () =>
  useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

/**
 * The console sign-in screen: either the credentials step or — when the
 * account has 2FA — the code step (emailed OTP, with a recovery-code fallback).
 *
 * A visitor with a persisted session is sent straight to the console, where
 * RequireAuth validates it for real (and bounces a stale one back here after
 * clearing it — no loop). Deliberately NOT a GET /auth/me here: for an
 * anonymous visitor that 401 would churn through the silent-refresh reset
 * machinery instead of just showing the form.
 */
export function LoginClient({ redirectTo }: { redirectTo: string }) {
  const [challengeEmail, setChallengeEmail] = useState<string | null>(null);
  const router = useRouter();
  const cachedUser = useCurrentUser();
  const hydrated = useHydrated();

  useEffect(() => {
    if (hydrated && cachedUser) router.replace(redirectTo);
  }, [hydrated, cachedUser, router, redirectTo]);

  // Pre-hydration (the persisted user lives in localStorage, invisible to the
  // server) and mid-redirect: hold the spinner, never flash the form.
  if (!hydrated || cachedUser) return <LoadingScreen className="min-h-screen" />;

  return (
    <AuthCard
      title={challengeEmail ? "Two-step verification" : "Sign in"}
      subtitle={
        challengeEmail
          ? "One more step to keep the business secure."
          : "Welcome back — sign in to run the trading house."
      }
    >
      {challengeEmail ? (
        <TwoFactorForm
          email={challengeEmail}
          redirectTo={redirectTo}
          onBack={() => setChallengeEmail(null)}
        />
      ) : (
        <LoginForm redirectTo={redirectTo} onChallenge={setChallengeEmail} />
      )}
    </AuthCard>
  );
}
