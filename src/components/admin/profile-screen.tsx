"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import {
  AdminButton,
  AdminCard,
  AdminField,
  AdminPageHeader,
  adminInputClass,
} from "@/components/admin/ui";
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

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: "Super admin",
  STAFF: "Office staff",
  AGENT: "Field agent",
};

const memberSince = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { month: "long", year: "numeric" });

/* ── Avatar ──────────────────────────────────────────────────────────────── */

function Avatar({
  user,
  previewUrl,
  size = 72,
  busy = false,
}: {
  user: IUser;
  /** A locally-chosen file's object URL, shown before the save lands. */
  previewUrl?: string | null;
  size?: number;
  busy?: boolean;
}) {
  const src = previewUrl ?? user.profilePicture;
  const initials =
    `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  return (
    <div
      className="relative flex-none overflow-hidden rounded-full"
      style={{ width: size, height: size }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- Cloudinary/objectURL avatar
        <img
          src={src}
          alt=""
          width={size}
          height={size}
          className="h-full w-full object-cover"
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center bg-console font-bold text-white"
          style={{ fontSize: size * 0.28 }}
        >
          {initials}
        </div>
      )}
      {busy ? (
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-slate-900/45">
          <Loader2
            className="h-5 w-5 animate-spin text-white"
            aria-hidden="true"
          />
        </div>
      ) : null}
    </div>
  );
}

/* ── Identity / edit profile ─────────────────────────────────────────────── */

function IdentityCard() {
  const user = useCurrentUser();
  const [editing, setEditing] = useState(false);
  if (!user) return null;

  return (
    <AdminCard className="px-5 py-[18px]">
      {editing ? (
        <ProfileEditForm user={user} onClose={() => setEditing(false)} />
      ) : (
        <div className="flex flex-wrap items-center gap-4">
          <Avatar user={user} />
          <div className="min-w-[180px] flex-1">
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
                Email change to {user.pendingEmail} awaiting confirmation —
                check that inbox.
              </div>
            ) : null}
          </div>
          <AdminButton
            variant="secondary"
            className="h-[34px] px-3.5 text-[13px] whitespace-nowrap"
            onClick={() => setEditing(true)}
          >
            Edit profile
          </AdminButton>
        </div>
      )}
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
  const fileInput = useRef<HTMLInputElement>(null);
  // File + its object URL travel together; URLs are created/revoked in the
  // event handlers (not an effect) and once more on unmount via the ref.
  const [chosen, setChosen] = useState<{ file: File; url: string } | null>(
    null,
  );
  const chosenUrl = useRef<string | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const photo = chosen?.file ?? null;
  const previewUrl = chosen?.url ?? null;

  const dropPreview = () => {
    if (chosenUrl.current) URL.revokeObjectURL(chosenUrl.current);
    chosenUrl.current = null;
  };
  // Revoke a still-live preview URL when the form unmounts.
  useEffect(() => dropPreview, []);

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

  const choosePhoto = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      notify.error("Choose an image file (JPG or PNG).");
      return;
    }
    dropPreview();
    const url = URL.createObjectURL(file);
    chosenUrl.current = url;
    setChosen({ file, url });
    setRemovePhoto(false);
  };

  const clearPhoto = () => {
    dropPreview();
    setChosen(null);
    if (fileInput.current) fileInput.current.value = "";
    // Clearing an EXISTING photo is a real deletion (Cloudinary + DB) that
    // happens on save; clearing a just-chosen file is purely local.
    if (user.profilePicture) setRemovePhoto(true);
  };

  const hasVisiblePhoto = Boolean(
    previewUrl ?? (removePhoto ? null : user.profilePicture),
  );

  const onSubmit = async (values: ProfileValues) => {
    try {
      const res = await updateMe({
        body: {
          firstName: values.firstName,
          lastName: values.lastName,
          // Only send the email when it actually changed — sending the same
          // address is a no-op, a new one starts the confirmation flow.
          ...(values.email !== user.email ? { email: values.email } : {}),
          phone: values.phone?.trim() ? values.phone.trim() : null,
          ...(removePhoto ? { removeProfilePicture: true } : {}),
        },
        photo: photo ?? undefined,
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
      className="flex flex-col gap-5 sm:flex-row sm:items-start"
    >
      {/* Photo block — avatar left, controls under it */}
      <div className="flex flex-none flex-col items-center gap-2">
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          disabled={isLoading}
          aria-label="Choose a profile photo"
          className="group relative cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-console/40 disabled:cursor-not-allowed"
        >
          <Avatar
            user={{
              ...user,
              profilePicture: removePhoto ? null : user.profilePicture,
            }}
            previewUrl={previewUrl}
            size={84}
            busy={isLoading && (photo !== null || removePhoto)}
          />
          <span className="absolute -right-0.5 -bottom-0.5 flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors group-hover:text-console">
            <Camera className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => choosePhoto(e.target.files?.[0])}
        />
        <span className="text-[11px] text-slate-400">JPG or PNG</span>
        {hasVisiblePhoto ? (
          <button
            type="button"
            onClick={clearPhoto}
            disabled={isLoading}
            className="inline-flex cursor-pointer items-center gap-1 text-[12px] font-semibold text-console-red hover:underline disabled:opacity-50"
          >
            <Trash2 className="h-3 w-3" aria-hidden="true" />
            Remove photo
          </button>
        ) : null}
      </div>

      {/* Details flow to the right */}
      <div className="grid min-w-0 flex-1 gap-[13px] sm:max-w-[420px]">
        <div className="grid gap-[13px] sm:grid-cols-2">
          <AdminField label="First name" error={errors.firstName?.message}>
            <Input
              className={cn(
                adminInputClass,
                errors.firstName && "border-console-red",
              )}
              {...register("firstName")}
            />
          </AdminField>
          <AdminField label="Last name" error={errors.lastName?.message}>
            <Input
              className={cn(
                adminInputClass,
                errors.lastName && "border-console-red",
              )}
              {...register("lastName")}
            />
          </AdminField>
        </div>
        <AdminField label="Email" error={errors.email?.message}>
          <Input
            type="email"
            className={cn(adminInputClass, errors.email && "border-console-red")}
            {...register("email")}
          />
        </AdminField>
        <AdminField label="Phone" error={errors.phone?.message}>
          <Input
            type="tel"
            placeholder="024 000 0000"
            className={cn(adminInputClass, errors.phone && "border-console-red")}
            {...register("phone")}
          />
        </AdminField>
        <p className="text-[12px] leading-[1.5] text-slate-400">
          Changing your email sends a confirmation link to the new address —
          your sign-in email only switches after you confirm it.
        </p>
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
    <AdminCard className="px-5 py-[18px]">
      <SectionLabel>Password</SectionLabel>
      {open ? (
        <form
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          className="flex max-w-[380px] flex-col gap-[13px]"
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
        <div className="mt-3.5 flex max-w-[380px] flex-col gap-2.5">
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
