"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import {
  AdminButton,
  AdminCard,
  AdminField,
  adminInputClass,
  AdminPageHeader,
  CommitRow,
  DetailShell,
  SectionHeading,
  ToneBadge,
} from "@/components/admin/ui";
import {
  IdentityFacts,
  ROLE_TITLE,
} from "@/components/admin/users/user-identity";
import { PhotoManager } from "@/components/admin/users/photo-manager";
import { useConfirm } from "@/hooks/use-confirm";
import { useCurrentUser } from "@/hooks/use-current-user";
import {
  useChangePasswordMutation,
  useConfirmTwoFactorSetupMutation,
  useDisableTwoFactorMutation,
  useRegenerateRecoveryCodesMutation,
  useRequestTwoFactorSetupMutation,
  useUpdateMeMutation,
} from "@/redux/auth/auth-api";
import { extractApiError } from "@/lib/extract-api-error";
import { notify } from "@/lib/notify";
import { cn } from "@/lib/utils";
import type { IUser } from "@/types/user.types";
import {
  changePasswordSchema,
  type ChangePasswordValues,
  profileSchema,
  type ProfileValues,
} from "@/validations/auth-schema";

/* ── Profile photo (managed on its own - no Edit mode required) ──────────── */

/** PhotoManager wired to the self-service PATCH /auth/me. */
function ProfilePhoto({ user }: { user: IUser }) {
  const [updateMe, { isLoading }] = useUpdateMeMutation();
  return (
    <PhotoManager
      user={user}
      isSaving={isLoading}
      onSave={async (file) => {
        try {
          await updateMe({ body: {}, photo: file }).unwrap();
          notify.success("Profile photo updated");
        } catch (err) {
          notify.error("Couldn't upload the photo", {
            description: extractApiError(err).message,
          });
          throw err;
        }
      }}
      onRemove={async () => {
        try {
          await updateMe({ body: { removeProfilePicture: true } }).unwrap();
          notify.success("Profile photo removed");
        } catch (err) {
          notify.error("Couldn't remove the photo", {
            description: extractApiError(err).message,
          });
          throw err;
        }
      }}
    />
  );
}

/* ── Identity ────────────────────────────────────────────────────────────── */

function IdentityCard() {
  const user = useCurrentUser();
  const [editing, setEditing] = useState(false);
  if (!user) return null;

  return (
    <AdminCard className="overflow-hidden p-0">
      {/* Forest banner: the page's one moment of colour. The avatar overlaps
          its lower edge, LinkedIn-style, framed white. */}
      <div className="relative h-[88px] overflow-hidden bg-gradient-to-r from-console-deep via-console to-[#2C5B3E]">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(-45deg, transparent 0 14px, #fff 14px 15px)",
          }}
        />
        <span
          aria-hidden="true"
          className="absolute right-4 top-1/2 hidden -translate-y-1/2 text-[11.5px] font-extrabold uppercase tracking-[0.3em] text-white/25 sm:block"
        >
          DB Plus
        </span>
      </div>

      <div className="px-4 pb-6 sm:px-6">
        <div className="-mt-[52px] flex flex-col items-center gap-3 sm:flex-row sm:items-end sm:gap-5">
          <ProfilePhoto user={user} />
          <div className="w-full min-w-0 flex-1 text-center sm:w-auto sm:pb-2 sm:text-left">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <h2
                title={`${user.firstName} ${user.lastName}`}
                // Full row on phones so the role/status badges sit together
                // on the line below instead of one trailing the name and the
                // other wrapping alone; inline beside the name from `sm`.
                className="line-clamp-2 max-w-full basis-full break-words text-[19px] leading-[1.3] font-bold tracking-[-0.01em] text-adm-ink sm:basis-auto"
              >
                {user.firstName} {user.lastName}
              </h2>
              <ToneBadge tone="forest">
                {ROLE_TITLE[user.role] ?? user.role}
              </ToneBadge>
            </div>
            <p
              className="mt-0.5 truncate text-[11.5px] text-adm-muted"
              title={user.email}
            >
              {user.email}
            </p>
            {user.pendingEmail ? (
              <p className="mt-1 text-[11px] font-medium text-console-gold">
                Email change to {user.pendingEmail} awaiting confirmation -
                check that inbox.
              </p>
            ) : null}
          </div>
          {!editing ? (
            <AdminButton
              variant="secondary"
              className="flex-none whitespace-nowrap sm:mb-2"
              onClick={() => setEditing(true)}
            >
              <Pencil className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
              Edit profile
            </AdminButton>
          ) : null}
        </div>

        <div className="mt-6 pt-3 sm:pt-6">
          {editing ? (
            <ProfileEditForm user={user} onClose={() => setEditing(false)} />
          ) : (
            <IdentityFacts user={user} />
          )}
        </div>
      </div>
    </AdminCard>
  );
}

function ProfileEditForm({
  user,
  onClose,
}: {
  user: IUser;
  onClose: () => void;
}) {
  const [updateMe, { isLoading }] = useUpdateMeMutation();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone ?? "",
    },
  });

  const onSubmit = async (values: ProfileValues) => {
    try {
      const res = await updateMe({
        body: {
          firstName: values.firstName,
          lastName: values.lastName,
          // Only send the email when it actually changed - a new one starts
          // the confirmation flow rather than switching directly.
          ...(values.email !== user.email ? { email: values.email } : {}),
          phone: values.phone?.trim() ? values.phone.trim() : null,
        },
      }).unwrap();
      notify.success("Profile updated");
      if (res.data.emailChangeRequested) {
        notify.info("Confirm your new email", {
          description:
            "We sent a link to the new address - your sign-in email changes after you confirm it.",
        });
      }
      onClose();
    } catch (err) {
      const { message, fieldErrors, hasFieldErrors } = extractApiError(err);
      if (hasFieldErrors && fieldErrors) {
        for (const field of [
          "firstName",
          "lastName",
          "email",
          "phone",
        ] as const) {
          if (fieldErrors[field])
            setError(field, { message: fieldErrors[field] });
        }
      }
      notify.error("Couldn't save your profile", { description: message });
    }
  };

  return (
    // Field pairs measure against this form, not the viewport: the console
    // shell keeps a ~225px rail beside it, so `sm:` would pair the names up
    // while the column is still too narrow for two.
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="@container grid gap-5"
    >
      <SectionHeading className="mb-0">Your details</SectionHeading>
      <div className="grid gap-5 @min-[440px]:grid-cols-2">
        <AdminField label="First name" error={errors.firstName?.message}>
          <Input
            placeholder="e.g. Abdul"
            className={cn(
              adminInputClass,
              errors.firstName && "border-console-red",
            )}
            {...register("firstName")}
          />
        </AdminField>
        <AdminField label="Last name" error={errors.lastName?.message}>
          <Input
            placeholder="e.g. Danaa"
            className={cn(
              adminInputClass,
              errors.lastName && "border-console-red",
            )}
            {...register("lastName")}
          />
        </AdminField>
      </div>
      <AdminField
        label="Email"
        hint="Changing it sends a confirmation link to the new address first."
        error={errors.email?.message}
      >
        <Input
          type="email"
          placeholder="e.g. you@dbplus.com"
          className={cn(adminInputClass, errors.email && "border-console-red")}
          {...register("email")}
        />
      </AdminField>
      <AdminField label="Phone" optional error={errors.phone?.message}>
        <Input
          type="tel"
          placeholder="e.g. 024 000 0000"
          className={cn(adminInputClass, errors.phone && "border-console-red")}
          {...register("phone")}
        />
      </AdminField>
      <CommitRow>
        <AdminButton
          type="button"
          variant="outline"
          disabled={isLoading}
          size="lg"
          onClick={onClose}
        >
          Cancel
        </AdminButton>
        <AdminButton
          type="submit"
          disabled={isLoading}
          loading={isLoading}
          size="lg"
        >
          {isLoading ? "Saving…" : "Save changes"}
        </AdminButton>
      </CommitRow>
    </form>
  );
}

/* ── Password ────────────────────────────────────────────────────────────── */

/** Read-only until "Change password" opens the form; the save itself sits
 * behind a confirmation modal (it signs out every other device). */
function PasswordCard() {
  const [open, setOpen] = useState(false);
  const { confirm, confirmationDialog } = useConfirm();
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

  const close = () => {
    setOpen(false);
    reset();
  };

  const onSubmit = async (values: ChangePasswordValues) => {
    const ok = await confirm({
      title: "Change your password?",
      description:
        "Every other device will be signed out; this one stays signed in.",
      confirmText: "Change password",
    });
    if (!ok) return;
    try {
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }).unwrap();
      close();
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
    <AdminCard className="@container/pw px-6 py-[18px]">
      <SectionHeading>Password</SectionHeading>
      {open ? (
        <form
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          className="@container grid max-w-[560px] gap-5"
        >
          <AdminField
            label="Current password"
            error={errors.currentPassword?.message}
          >
            <PasswordInput
              autoComplete="current-password"
              placeholder="The one you sign in with now"
              className={cn(
                adminInputClass,
                errors.currentPassword && "border-console-red",
              )}
              {...register("currentPassword")}
            />
          </AdminField>
          <div className="grid gap-5 @min-[440px]:grid-cols-2">
            <AdminField
              label="New password"
              error={errors.newPassword?.message}
            >
              <PasswordInput
                autoComplete="new-password"
                placeholder="At least 8 characters"
                className={cn(
                  adminInputClass,
                  errors.newPassword && "border-console-red",
                )}
                {...register("newPassword")}
              />
            </AdminField>
            <AdminField
              label="Confirm new password"
              error={errors.confirm?.message}
            >
              <PasswordInput
                autoComplete="new-password"
                placeholder="Type the new one again"
                className={cn(
                  adminInputClass,
                  errors.confirm && "border-console-red",
                )}
                {...register("confirm")}
              />
            </AdminField>
          </div>
          <CommitRow>
            <AdminButton
              type="button"
              variant="outline"
              size="lg"
              onClick={close}
            >
              Cancel
            </AdminButton>
            <AdminButton
              type="submit"
              disabled={isLoading}
              loading={isLoading}
              size="lg"
            >
              {isLoading ? "Updating…" : "Update password"}
            </AdminButton>
          </CommitRow>
        </form>
      ) : (
        <div className="flex flex-col items-start gap-3 @min-[440px]/pw:flex-row @min-[440px]/pw:items-center @min-[440px]/pw:justify-between">
          <div className="min-w-0">
            <div className="font-adminmono text-[12.5px] tracking-[0.2em] text-adm-faint">
              ••••••••••
            </div>
            <div className="mt-0.5 text-[11px] text-adm-muted">
              Changing your password signs out every other device.
            </div>
          </div>
          <AdminButton
            variant="secondary"
            className="flex-none whitespace-nowrap"
            onClick={() => setOpen(true)}
          >
            Change password
          </AdminButton>
        </div>
      )}
      {confirmationDialog}
    </AdminCard>
  );
}

/* ── Two-factor authentication ───────────────────────────────────────────── */

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
      notify.error("Couldn't copy - select and copy them manually.");
    }
  };
  return (
    <div className="mt-3 rounded-none border border-console-gold/40 bg-[#FBF6EA] p-3.5">
      <div className="text-[11px] font-semibold text-adm-ink">
        Save these recovery codes now - they are shown only once.
      </div>
      <p className="mt-1 text-[11px] leading-[1.5] text-adm-muted">
        Each code signs you in once if you can&apos;t receive the email code.
        Keep them somewhere safe (not in this browser).
      </p>
      <div className="font-adminmono mt-2.5 grid grid-cols-2 gap-x-6 gap-y-1.5 text-[11.5px] text-adm-ink">
        {codes.map((code) => (
          <span key={code}>{code}</span>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <AdminButton variant="secondary" onClick={copyAll}>
          Copy all
        </AdminButton>
        <AdminButton variant="outline" onClick={onDismiss}>
          I&apos;ve saved them
        </AdminButton>
      </div>
    </div>
  );
}

/** Email-OTP 2FA lifecycle. Turning it ON sits behind a confirmation modal
 * (it changes every future sign-in); the emailed code then confirms it. */
function TwoFactorCard() {
  const user = useCurrentUser();
  const { confirm, confirmationDialog } = useConfirm();
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
    const ok = await confirm({
      title: "Turn on two-factor authentication?",
      description:
        "Every sign-in will then require a 6-digit code emailed to you, on top of your password. We'll email a code now to confirm the setup.",
      confirmText: "Send the code",
    });
    if (!ok) return;
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

  const confirmCode = async () => {
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

  const closeStep = () => {
    setStep("idle");
    setCode("");
    setPassword("");
  };

  /** The password check that guards turning 2FA off or replacing the codes. */
  const passwordStep = (purpose: "disable" | "regen") => (
    <div className="mt-3 grid gap-3">
      <AdminField
        label={
          purpose === "disable"
            ? "Your password, to turn this off"
            : "Your password, to replace the codes"
        }
      >
        <PasswordInput
          autoComplete="current-password"
          autoFocus
          placeholder="Your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={adminInputClass}
        />
      </AdminField>
      <CommitRow>
        <AdminButton variant="outline" onClick={closeStep}>
          Cancel
        </AdminButton>
        <AdminButton
          variant={purpose === "disable" ? "danger" : "primary"}
          disabled={
            (purpose === "disable" ? isDisabling : isRegenerating) ||
            password.length === 0
          }
          onClick={purpose === "disable" ? submitDisable : submitRegenerate}
        >
          {purpose === "disable"
            ? isDisabling
              ? "Turning off…"
              : "Turn off 2FA"
            : isRegenerating
              ? "Generating…"
              : "Generate new codes"}
        </AdminButton>
      </CommitRow>
    </div>
  );

  // Each setting reads top to bottom - what it is, what it does, then its
  // action - so the card stays legible in the narrow side rail it lives in.
  return (
    <AdminCard className="px-6 py-[18px]">
      <SectionHeading
        actions={
          <ToneBadge tone={enabled ? "forest" : "slate"}>
            {enabled ? "On" : "Off"}
          </ToneBadge>
        }
        hint="A second check at sign-in, so a password on its own cannot open your account."
      >
        Two-factor authentication
      </SectionHeading>

      <section aria-label="Email codes">
        <h3 className="text-[12px] font-semibold text-adm-ink">Email codes</h3>
        <p className="mt-1 text-[11.5px] leading-[1.6] text-adm-muted [overflow-wrap:anywhere]">
          {enabled ? (
            <>
              Every sign-in asks for a 6-digit code sent to{" "}
              <span className="font-medium text-adm-ink">
                {user?.email ?? "your email"}
              </span>
              , on top of your password.
            </>
          ) : (
            "Add a second step to signing in: a 6-digit code emailed to you each time, on top of your password."
          )}
        </p>

        {step === "confirm" ? (
          <div className="mt-3 grid gap-3">
            <AdminField
              label="Code from the email"
              hint="We sent a 6-digit code to your email. It confirms you can receive them."
            >
              <Input
                autoComplete="one-time-code"
                autoFocus
                className={cn(
                  adminInputClass,
                  "font-adminmono tracking-[0.3em]",
                )}
                inputMode="numeric"
                maxLength={6}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
                value={code}
              />
            </AdminField>
            <CommitRow>
              <AdminButton variant="outline" onClick={closeStep}>
                Cancel
              </AdminButton>
              <AdminButton
                disabled={isConfirming || !/^\d{6}$/.test(code.trim())}
                onClick={confirmCode}
              >
                {isConfirming ? "Confirming…" : "Confirm and turn on"}
              </AdminButton>
            </CommitRow>
          </div>
        ) : step === "disable" ? (
          passwordStep("disable")
        ) : (
          <div className="mt-3">
            {enabled ? (
              <AdminButton
                variant="outline"
                className="text-console-red hover:text-console-red"
                onClick={() => {
                  setStep("disable");
                  setPassword("");
                }}
              >
                Turn off
              </AdminButton>
            ) : (
              <AdminButton disabled={isRequesting} onClick={begin}>
                {isRequesting ? "Sending code…" : "Turn on"}
              </AdminButton>
            )}
          </div>
        )}
      </section>

      {enabled || freshCodes ? (
        <section
          aria-label="Recovery codes"
          className="mt-5 border-t border-adm-hairline pt-4"
        >
          <h3 className="text-[12px] font-semibold text-adm-ink">
            Recovery codes
          </h3>
          <p className="mt-1 text-[11.5px] leading-[1.6] text-adm-muted">
            One-time codes that sign you in when the email code does not arrive.
            A new set replaces the old one.
          </p>
          {freshCodes ? (
            <RecoveryCodesPanel
              codes={freshCodes}
              onDismiss={() => setFreshCodes(null)}
            />
          ) : step === "regen" ? (
            passwordStep("regen")
          ) : (
            <div className="mt-3">
              <AdminButton
                variant="secondary"
                onClick={() => {
                  setStep("regen");
                  setPassword("");
                }}
              >
                Generate new codes
              </AdminButton>
            </div>
          )}
        </section>
      ) : null}
      {confirmationDialog}
    </AdminCard>
  );
}

export function ProfileScreen() {
  return (
    <div className="w-full max-w-[1120px]">
      <AdminPageHeader
        title="My profile"
        hint="Your own account: name, photo, password and sign-in security."
        sub="Your account, security and sign-in settings"
      />
      <DetailShell
        asideFirstOnStack={false}
        main={<IdentityCard />}
        aside={
          <div className="flex flex-col gap-4">
            <PasswordCard />
            <TwoFactorCard />
          </div>
        }
      />
    </div>
  );
}
