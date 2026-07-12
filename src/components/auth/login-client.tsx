"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { useGetMeQuery } from "@/redux/auth/auth-api";
import { AuthCard } from "./auth-card";
import { LoginForm } from "./login-form";
import { TwoFactorForm } from "./two-factor-form";

/**
 * The console sign-in screen: either the credentials step or — when the
 * account has 2FA — the code step (emailed OTP, with a recovery-code fallback).
 *
 * A visitor who already holds a live session is sent straight to the console
 * (professional convention: the login page validates with GET /auth/me rather
 * than trusting a cookie's presence — a stale cookie still gets the form).
 */
export function LoginClient({ redirectTo }: { redirectTo: string }) {
  const [challengeEmail, setChallengeEmail] = useState<string | null>(null);
  const router = useRouter();
  const { data: session, isLoading: checking } = useGetMeQuery();

  useEffect(() => {
    if (session) router.replace(redirectTo);
  }, [session, router, redirectTo]);

  // Hold a spinner while the session check runs or the redirect fires — never
  // flash the sign-in form at an already-signed-in user.
  if (checking || session) return <LoadingScreen className="min-h-screen" />;

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
