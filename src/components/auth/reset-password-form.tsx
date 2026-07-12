"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthField } from "./auth-field";
import { AuthSubmit } from "./auth-submit";
import { notify } from "@/lib/notify";
import { extractApiError } from "@/lib/extract-api-error";
import { useResetPasswordMutation } from "@/redux/auth/auth-api";
import {
  resetPasswordSchema,
  type ResetPasswordValues,
} from "@/validations/auth-schema";

/** Sets the new password against the emailed single-use token. Completing it
 * also clears any brute-force block on the account (proof of mailbox control). */
export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirm: "" },
  });

  const onSubmit = async (values: ResetPasswordValues) => {
    try {
      await resetPassword({ token, password: values.password }).unwrap();
      notify.success("Password updated", {
        description: "Sign in with your new password.",
      });
      router.replace("/login");
    } catch (err) {
      const { message, fieldErrors, hasFieldErrors } = extractApiError(err);
      if (hasFieldErrors && fieldErrors?.password) {
        setError("password", { message: fieldErrors.password });
      }
      notify.error("Couldn't reset your password", { description: message });
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
      <AuthField
        label="New password"
        type="password"
        autoComplete="new-password"
        placeholder="At least 8 characters"
        error={errors.password?.message}
        {...register("password")}
      />
      <AuthField
        label="Confirm password"
        type="password"
        autoComplete="new-password"
        placeholder="Type it again"
        error={errors.confirm?.message}
        {...register("confirm")}
      />
      <AuthSubmit isLoading={isLoading} loadingText="Saving…">
        Set new password
      </AuthSubmit>
    </form>
  );
}
