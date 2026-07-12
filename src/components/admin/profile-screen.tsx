"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import {
  AdminButton,
  AdminCard,
  AdminField,
  AdminPageHeader,
  ToneBadge,
  adminInputClass,
} from "@/components/admin/ui";
import {
  IdentityAvatar,
  IdentityFacts,
  PhotoViewDialog,
  ROLE_TITLE,
} from "@/components/admin/users/user-identity";
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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3.5 text-[10.5px] font-bold tracking-[0.1em] text-slate-400 uppercase">
      {children}
    </div>
  );
}

/* ── Profile photo (managed on its own — no Edit mode required) ──────────── */

/**
 * The avatar with its own lifecycle: click the photo to view it full-size
 * (square), the camera button to pick a new one (uploads immediately with a
 * busy overlay — the file travels multipart and the backend owns Cloudinary),
 * and the trash to remove it (confirm-gated; the backend deletes the asset
 * and clears the stored URL).
 */
function AvatarManager({ user }: { user: IUser }) {
  const [updateMe, { isLoading }] = useUpdateMeMutation();
  const { confirm, confirmationDialog } = useConfirm();
  const fileInput = useRef<HTMLInputElement>(null);
  const [viewing, setViewing] = useState(false);

  const upload = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      notify.error("Choose an image file (JPG or PNG).");
      return;
    }
    try {
      await updateMe({ body: {}, photo: file }).unwrap();
      notify.success("Profile photo updated");
    } catch (err) {
      notify.error("Couldn't upload the photo", {
        description: extractApiError(err).message,
      });
    } finally {
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const remove = async () => {
    const ok = await confirm({
      title: "Remove your profile photo?",
      description: "The photo is deleted from storage as well.",
      confirmText: "Remove photo",
      isDestructive: true,
    });
    if (!ok) return;
    try {
      await updateMe({ body: { removeProfilePicture: true } }).unwrap();
      notify.success("Profile photo removed");
    } catch (err) {
      notify.error("Couldn't remove the photo", {
        description: extractApiError(err).message,
      });
    }
  };

  return (
    <div className="flex flex-none flex-col items-center gap-2">
      {user.profilePicture ? (
        <button
          type="button"
          onClick={() => setViewing(true)}
          aria-label="View profile photo"
          title="View photo"
          className="cursor-zoom-in rounded-full outline-none focus-visible:ring-2 focus-visible:ring-console/40"
        >
          <IdentityAvatar
            user={user}
            src={user.profilePicture}
            size={104}
            busy={isLoading}
          />
        </button>
      ) : (
        <IdentityAvatar user={user} src={null} size={104} busy={isLoading} />
      )}

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          disabled={isLoading}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-[6px] border border-slate-200 bg-white px-2.5 py-1.5 text-[12px] font-semibold text-slate-600 transition-colors hover:border-console hover:text-console disabled:opacity-50"
        >
          <Camera className="h-3.5 w-3.5" aria-hidden="true" />
          {user.profilePicture ? "Change" : "Add photo"}
        </button>
        {user.profilePicture ? (
          <button
            type="button"
            onClick={() => void remove()}
            disabled={isLoading}
            aria-label="Remove photo"
            title="Remove photo"
            className="flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-[6px] border border-slate-200 bg-white text-slate-400 transition-colors hover:border-console-red hover:text-console-red disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        ) : null}
      </div>
      <span className="text-[11px] text-slate-400">JPG or PNG</span>

      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => void upload(e.target.files?.[0])}
      />
      {user.profilePicture ? (
        <PhotoViewDialog
          src={user.profilePicture}
          name={`${user.firstName} ${user.lastName}`}
          open={viewing}
          onOpenChange={setViewing}
        />
      ) : null}
      {confirmationDialog}
    </div>
  );
}

/* ── Identity ────────────────────────────────────────────────────────────── */

function IdentityCard() {
  const user = useCurrentUser();
  const [editing, setEditing] = useState(false);
  if (!user) return null;

  return (
    <AdminCard className="px-6 py-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <AvatarManager user={user} />

        <div className="min-w-0 flex-1">
          {editing ? (
            <ProfileEditForm user={user} onClose={() => setEditing(false)} />
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className="text-[19px] font-bold tracking-[-0.01em] text-slate-900">
                      {user.firstName} {user.lastName}
                    </h2>
                    <ToneBadge tone="forest">
                      {ROLE_TITLE[user.role] ?? user.role}
                    </ToneBadge>
                  </div>
                  {user.pendingEmail ? (
                    <p className="mt-1.5 text-[12px] font-medium text-console-gold">
                      Email change to {user.pendingEmail} awaiting confirmation
                      — check that inbox.
                    </p>
                  ) : null}
                </div>
                <AdminButton
                  variant="secondary"
                  className="h-[34px] flex-none px-3.5 text-[13px] whitespace-nowrap"
                  onClick={() => setEditing(true)}
                >
                  <Pencil className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                  Edit profile
                </AdminButton>
              </div>

              <div className="mt-5 border-t border-slate-100 pt-5">
                <IdentityFacts user={user} />
              </div>
            </>
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
          // Only send the email when it actually changed — a new one starts
          // the confirmation flow rather than switching directly.
          ...(values.email !== user.email ? { email: values.email } : {}),
          phone: values.phone?.trim() ? values.phone.trim() : null,
        },
      }).unwrap();
      notify.success("Profile updated");
      if (res.data.emailChangeRequested) {
        notify.info("Confirm your new email", {
          description:
            "We sent a link to the new address — your sign-in email changes after you confirm it.",
        });
      }
      onClose();
    } catch (err) {
      const { message, fieldErrors, hasFieldErrors } = extractApiError(err);
      if (hasFieldErrors && fieldErrors) {
        for (const field of ["firstName", "lastName", "email", "phone"] as const) {
          if (fieldErrors[field]) setError(field, { message: fieldErrors[field] });
        }
      }
      notify.error("Couldn't save your profile", { description: message });
    }
  };

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="grid max-w-[560px] gap-[15px]"
    >
      <div className="grid gap-[15px] sm:grid-cols-2">
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
          placeholder="you@dbplus.com"
          className={cn(adminInputClass, errors.email && "border-console-red")}
          {...register("email")}
        />
      </AdminField>
      <AdminField label="Phone" optional error={errors.phone?.message}>
        <Input
          type="tel"
          placeholder="024 000 0000"
          className={cn(adminInputClass, errors.phone && "border-console-red")}
          {...register("phone")}
        />
      </AdminField>
      <div className="flex gap-2">
        <AdminButton
          type="submit"
          disabled={isLoading}
          className="h-[36px] px-4 text-[13px]"
        >
          {isLoading ? "Saving…" : "Save changes"}
        </AdminButton>
        <AdminButton
          type="button"
          variant="ghost"
          disabled={isLoading}
          className="h-[36px] px-3.5 text-[13px]"
          onClick={onClose}
        >
          Cancel
        </AdminButton>
      </div>
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
    <AdminCard className="px-6 py-[18px]">
      <SectionLabel>Password</SectionLabel>
      {open ? (
        <form
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          className="grid max-w-[560px] gap-[15px]"
        >
          <AdminField
            label="Current password"
            error={errors.currentPassword?.message}
          >
            <PasswordInput
              autoComplete="current-password"
              placeholder="Enter your current password"
              className={cn(
                adminInputClass,
                errors.currentPassword && "border-console-red",
              )}
              {...register("currentPassword")}
            />
          </AdminField>
          <div className="grid gap-[15px] sm:grid-cols-2">
            <AdminField label="New password" error={errors.newPassword?.message}>
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
                placeholder="Repeat the new password"
                className={cn(
                  adminInputClass,
                  errors.confirm && "border-console-red",
                )}
                {...register("confirm")}
              />
            </AdminField>
          </div>
          <div className="flex gap-2">
            <AdminButton
              type="submit"
              disabled={isLoading}
              className="h-[36px] px-4 text-[13px]"
            >
              {isLoading ? "Updating…" : "Update password"}
            </AdminButton>
            <AdminButton
              type="button"
              variant="ghost"
              className="h-[36px] px-3.5 text-[13px]"
              onClick={close}
            >
              Cancel
            </AdminButton>
          </div>
        </form>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="font-adminmono text-[15px] tracking-[0.2em] text-slate-400">
              ••••••••••
            </div>
            <div className="mt-0.5 text-[12.5px] text-slate-500">
              Changing your password signs out every other device.
            </div>
          </div>
          <AdminButton
            variant="secondary"
            className="h-[34px] flex-none px-3.5 text-[13px] whitespace-nowrap"
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

  return (
    <AdminCard className="px-6 py-[18px]">
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
        <div className="mt-3.5 grid max-w-[560px] gap-2.5">
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
              onClick={confirmCode}
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
        <div className="mt-3.5 grid max-w-[560px] gap-2.5">
          <AdminField
            label={
              step === "disable"
                ? "Confirm your password to turn off 2FA"
                : "Confirm your password to replace your recovery codes"
            }
          >
            <PasswordInput
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
            Two-factor authentication is on. Lost your recovery codes? Generate
            a new set above.
          </span>
        </div>
      ) : null}

      {freshCodes ? (
        <RecoveryCodesPanel
          codes={freshCodes}
          onDismiss={() => setFreshCodes(null)}
        />
      ) : null}
      {confirmationDialog}
    </AdminCard>
  );
}

export function ProfileScreen() {
  return (
    <div className="max-w-[720px]">
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
