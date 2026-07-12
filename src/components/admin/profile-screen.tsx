"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import {
  AdminButton,
  AdminCard,
  AdminField,
  AdminPageHeader,
  adminInputClass,
} from "@/components/admin/ui";
import { useCurrentUser } from "@/hooks/use-current-user";
import {
  useChangePasswordMutation,
  useConfirmTwoFactorSetupMutation,
  useDisableTwoFactorMutation,
  useRegenerateRecoveryCodesMutation,
  useRequestTwoFactorSetupMutation,
} from "@/redux/auth/auth-api";
import { extractApiError } from "@/lib/extract-api-error";
import { notify } from "@/lib/notify";
import { cn } from "@/lib/utils";
import {
  changePasswordSchema,
  type ChangePasswordValues,
} from "@/validations/auth-schema";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3.5 text-[10.5px] font-bold tracking-[0.1em] text-slate-400 uppercase">
      {children}
    </div>
  );
}

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: "Super admin",
  STAFF: "Office staff",
  AGENT: "Field agent",
};

const memberSince = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { month: "long", year: "numeric" });

/** Header card: the signed-in user's identity, read from the auth store. */
function IdentityCard() {
  const user = useCurrentUser();
  if (!user) return null;
  const initials =
    `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  return (
    <AdminCard className="flex flex-wrap items-center gap-3.5 px-5 py-[18px]">
      <div className="flex h-14 w-14 flex-none items-center justify-center rounded-full bg-console text-[19px] font-bold text-white">
        {initials}
      </div>
      <div className="min-w-[160px] flex-1">
        <div className="text-[16px] font-bold text-slate-900">
          {user.firstName} {user.lastName}
        </div>
        <div className="text-[13px] text-slate-500">
          {ROLE_LABEL[user.role] ?? user.role}
          {user.phone ? ` · ${user.phone}` : ""} · {user.email}
        </div>
        <div className="mt-0.5 text-[12px] text-slate-400">
          Member since {memberSince(user.createdAt)}
          {user.lastLoginAt
            ? ` · Last sign-in ${new Date(user.lastLoginAt).toLocaleString("en-GB")}`
            : ""}
        </div>
        {user.pendingEmail ? (
          <div className="mt-1 text-[12px] font-medium text-console-gold">
            Email change to {user.pendingEmail} awaiting confirmation — check
            that inbox.
          </div>
        ) : null}
      </div>
    </AdminCard>
  );
}

/** Change-password card, wired to PATCH /auth/change-password. A success keeps
 * this device signed in (the backend re-issues the session) and signs out
 * every other device. */
function PasswordCard() {
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirm: "" },
  });

  const onSubmit = async (values: ChangePasswordValues) => {
    try {
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }).unwrap();
      reset();
      notify.success("Password updated", {
        description: "Other devices were signed out; this one stays in.",
      });
    } catch (err) {
      const { message, fieldErrors, hasFieldErrors } = extractApiError(err);
      if (hasFieldErrors && fieldErrors) {
        if (fieldErrors.currentPassword)
          setError("currentPassword", { message: fieldErrors.currentPassword });
        if (fieldErrors.newPassword)
          setError("newPassword", { message: fieldErrors.newPassword });
      }
      notify.error("Couldn't update your password", { description: message });
    }
  };

  return (
    <AdminCard className="px-5 py-[18px]">
      <SectionLabel>Change password</SectionLabel>
      <form
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        className="flex max-w-[380px] flex-col gap-[13px]"
      >
        <AdminField
          label="Current password"
          error={errors.currentPassword?.message}
        >
          <Input
            type="password"
            autoComplete="current-password"
            placeholder="Enter your current password"
            className={cn(
              adminInputClass,
              errors.currentPassword && "border-console-red",
            )}
            {...register("currentPassword")}
          />
        </AdminField>
        <AdminField label="New password" error={errors.newPassword?.message}>
          <Input
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            className={cn(
              adminInputClass,
              errors.newPassword && "border-console-red",
            )}
            {...register("newPassword")}
          />
        </AdminField>
        <AdminField label="Confirm new password" error={errors.confirm?.message}>
          <Input
            type="password"
            autoComplete="new-password"
            placeholder="Repeat the new password"
            className={cn(
              adminInputClass,
              errors.confirm && "border-console-red",
            )}
            {...register("confirm")}
          />
        </AdminField>
        <div>
          <AdminButton
            type="submit"
            disabled={isLoading}
            className="h-[38px] px-[18px]"
          >
            {isLoading ? "Updating…" : "Update password"}
          </AdminButton>
        </div>
      </form>
    </AdminCard>
  );
}

/** One-time display of freshly issued recovery codes — the only moment they
 * exist in plaintext. Offers copy-to-clipboard; dismissing is deliberate. */
function RecoveryCodesPanel({
  codes,
  onDismiss,
}: {
  codes: string[];
  onDismiss: () => void;
}) {
  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(codes.join("\n"));
      notify.success("Recovery codes copied");
    } catch {
      notify.error("Couldn't copy — select and copy them manually.");
    }
  };
  return (
    <div className="mt-3 rounded-[6px] border border-console-gold/40 bg-[#FBF6EA] p-3.5">
      <div className="text-[12.5px] font-semibold text-slate-800">
        Save these recovery codes now — they are shown only once.
      </div>
      <p className="mt-1 text-[12px] leading-[1.5] text-slate-600">
        Each code signs you in once if you can&apos;t receive the email code.
        Keep them somewhere safe (not in this browser).
      </p>
      <div className="font-adminmono mt-2.5 grid grid-cols-2 gap-x-6 gap-y-1.5 text-[13px] text-slate-800">
        {codes.map((code) => (
          <span key={code}>{code}</span>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <AdminButton
          variant="secondary"
          className="h-[32px] px-3 text-[12.5px]"
          onClick={copyAll}
        >
          Copy all
        </AdminButton>
        <AdminButton
          variant="ghost"
          className="h-[32px] px-3 text-[12.5px]"
          onClick={onDismiss}
        >
          I&apos;ve saved them
        </AdminButton>
      </div>
    </div>
  );
}

/** Email-OTP 2FA lifecycle: request → confirm with the emailed code → save the
 * one-time recovery codes; disable and regenerate both re-check the password. */
function TwoFactorCard() {
  const user = useCurrentUser();
  const [requestSetup, { isLoading: isRequesting }] =
    useRequestTwoFactorSetupMutation();
  const [confirmSetup, { isLoading: isConfirming }] =
    useConfirmTwoFactorSetupMutation();
  const [disable, { isLoading: isDisabling }] = useDisableTwoFactorMutation();
  const [regenerate, { isLoading: isRegenerating }] =
    useRegenerateRecoveryCodesMutation();

  const [step, setStep] = useState<"idle" | "confirm" | "disable" | "regen">(
    "idle",
  );
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [freshCodes, setFreshCodes] = useState<string[] | null>(null);

  const enabled = user?.twoFactorEnabled ?? false;

  const begin = async () => {
    try {
      await requestSetup().unwrap();
      setStep("confirm");
      notify.success("Code sent", {
        description: "Check your email for the 6-digit confirmation code.",
      });
    } catch (err) {
      notify.error("Couldn't start 2FA setup", {
        description: extractApiError(err).message,
      });
    }
  };

  const confirm = async () => {
    try {
      const res = await confirmSetup({ code: code.trim() }).unwrap();
      setFreshCodes(res.data.recoveryCodes);
      setStep("idle");
      setCode("");
      notify.success("Two-factor authentication is on");
    } catch (err) {
      notify.error("That code didn't work", {
        description: extractApiError(err).message,
      });
    }
  };

  const submitDisable = async () => {
    try {
      await disable({ password }).unwrap();
      setStep("idle");
      setPassword("");
      setFreshCodes(null);
      notify.info("Two-factor authentication is off");
    } catch (err) {
      notify.error("Couldn't turn off 2FA", {
        description: extractApiError(err).message,
      });
    }
  };

  const submitRegenerate = async () => {
    try {
      const res = await regenerate({ password }).unwrap();
      setFreshCodes(res.data.recoveryCodes);
      setStep("idle");
      setPassword("");
      notify.success("New recovery codes generated", {
        description: "Your old codes no longer work.",
      });
    } catch (err) {
      notify.error("Couldn't regenerate the codes", {
        description: extractApiError(err).message,
      });
    }
  };

  return (
    <AdminCard className="px-5 py-[18px]">
      <SectionLabel>Two-factor authentication</SectionLabel>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[13.5px] font-semibold text-slate-900">
            {enabled ? "Email codes — enabled" : "Email codes — off"}
          </div>
          <div className="mt-0.5 text-[12.5px] text-slate-500">
            {enabled
              ? `A 6-digit code is emailed to ${user?.email ?? "you"} at every sign-in.`
              : "Add a second step to sign-in: a 6-digit code emailed to you."}
          </div>
        </div>
        {enabled ? (
          <div className="flex flex-none gap-2">
            <AdminButton
              variant="secondary"
              className="h-[32px] px-3 text-[12.5px] whitespace-nowrap"
              onClick={() => {
                setStep(step === "regen" ? "idle" : "regen");
                setPassword("");
              }}
            >
              New recovery codes
            </AdminButton>
            <AdminButton
              variant="ghost"
              className="h-[32px] px-3 text-[12.5px] whitespace-nowrap text-console-red hover:text-console-red"
              onClick={() => {
                setStep(step === "disable" ? "idle" : "disable");
                setPassword("");
              }}
            >
              Turn off
            </AdminButton>
          </div>
        ) : (
          <AdminButton
            className="h-[32px] flex-none px-3.5 text-[12.5px] whitespace-nowrap"
            disabled={isRequesting || step === "confirm"}
            onClick={begin}
          >
            {isRequesting ? "Sending code…" : "Turn on"}
          </AdminButton>
        )}
      </div>

      {step === "confirm" ? (
        <div className="mt-3.5 flex max-w-[380px] flex-col gap-2.5">
          <AdminField label="Confirmation code">
            <Input
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className={adminInputClass}
            />
          </AdminField>
          <div className="flex gap-2">
            <AdminButton
              className="h-[34px] px-3.5 text-[12.5px]"
              disabled={isConfirming || !/^\d{6}$/.test(code.trim())}
              onClick={confirm}
            >
              {isConfirming ? "Confirming…" : "Confirm & enable"}
            </AdminButton>
            <AdminButton
              variant="ghost"
              className="h-[34px] px-3 text-[12.5px]"
              onClick={() => {
                setStep("idle");
                setCode("");
              }}
            >
              Cancel
            </AdminButton>
          </div>
        </div>
      ) : null}

      {step === "disable" || step === "regen" ? (
        <div className="mt-3.5 flex max-w-[380px] flex-col gap-2.5">
          <AdminField
            label={
              step === "disable"
                ? "Confirm your password to turn off 2FA"
                : "Confirm your password to replace your recovery codes"
            }
          >
            <Input
              type="password"
              autoComplete="current-password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={adminInputClass}
            />
          </AdminField>
          <div className="flex gap-2">
            <AdminButton
              className={cn(
                "h-[34px] px-3.5 text-[12.5px]",
                step === "disable" &&
                  "bg-console-red hover:bg-console-red-deep",
              )}
              disabled={
                (step === "disable" ? isDisabling : isRegenerating) ||
                password.length === 0
              }
              onClick={step === "disable" ? submitDisable : submitRegenerate}
            >
              {step === "disable"
                ? isDisabling
                  ? "Turning off…"
                  : "Turn off 2FA"
                : isRegenerating
                  ? "Generating…"
                  : "Generate new codes"}
            </AdminButton>
            <AdminButton
              variant="ghost"
              className="h-[34px] px-3 text-[12.5px]"
              onClick={() => {
                setStep("idle");
                setPassword("");
              }}
            >
              Cancel
            </AdminButton>
          </div>
        </div>
      ) : null}

      {enabled && freshCodes === null && step === "idle" ? (
        <div className="mt-3 flex items-center gap-2 rounded-[6px] bg-[#E6F0E9] px-3 py-[9px] text-[12.5px] text-[#2F5E3D]">
          <span className="font-bold">✓</span>
          <span>
            Two-factor authentication is on. Lost your recovery codes?
            Generate a new set above.
          </span>
        </div>
      ) : null}

      {freshCodes ? (
        <RecoveryCodesPanel
          codes={freshCodes}
          onDismiss={() => setFreshCodes(null)}
        />
      ) : null}
    </AdminCard>
  );
}

export function ProfileScreen() {
  return (
    <div className="max-w-[640px]">
      <AdminPageHeader
        title="My profile"
        sub="Your account, security and sign-in settings"
      />
      <div className="flex flex-col gap-4">
        <IdentityCard />
        <PasswordCard />
        <TwoFactorCard />
      </div>
    </div>
  );
}
