"use client";

import { useState } from "react";
import { AuthCard } from "./auth-card";
import { LoginForm } from "./login-form";
import { TwoFactorForm } from "./two-factor-form";

/**
 * The console sign-in screen: either the credentials step or — when the
 * account has 2FA — the code step (emailed OTP, with a recovery-code fallback).
 */
export function LoginClient({ redirectTo }: { redirectTo: string }) {
  const [challengeEmail, setChallengeEmail] = useState<string | null>(null);

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
