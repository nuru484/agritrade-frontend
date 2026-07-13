"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthField } from "./auth-field";
import { AuthSubmit } from "./auth-submit";
import { notify } from "@/lib/notify";
import { extractApiError } from "@/lib/extract-api-error";
import { useLoginMutation } from "@/redux/auth/auth-api";
import { isTwoFactorChallenge } from "@/types/auth.types";
import { loginSchema, type LoginValues } from "@/validations/auth-schema";

interface LoginFormProps {
  /** Where to send the user after a full (non-2FA) login. */
  redirectTo: string;
  /** Called when the account requires a second factor to finish signing in. */
  onChallenge: (email: string) => void;
}

export function LoginForm({ redirectTo, onChallenge }: LoginFormProps) {
  const router = useRouter();
  const [login, { isLoading }] = useLoginMutation();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginValues) => {
    try {
      const res = await login(values).unwrap();
      if (isTwoFactorChallenge(res.data)) {
        onChallenge(res.data.email);
        return;
      }
      notify.success("Welcome back");
      router.replace(redirectTo);
    } catch (err) {
      const { message, fieldErrors, hasFieldErrors } = extractApiError(err);
      if (hasFieldErrors && fieldErrors) {
        for (const [field, msg] of Object.entries(fieldErrors)) {
          if (field === "email" || field === "password") {
            setError(field, { message: msg });
          }
        }
      }
      notify.error("Couldn't sign you in", { description: message });
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
      <AuthField
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@dbplus.com"
        error={errors.email?.message}
        {...register("email")}
      />
      <div className="grid gap-1.5">
        <AuthField
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="Your password"
          error={errors.password?.message}
          {...register("password")}
        />
        <Link
          href="/forgot-password"
          className="justify-self-end text-[12.5px] font-semibold text-console no-underline transition-colors hover:text-console-deep"
        >
          Forgot password?
        </Link>
      </div>
      <AuthSubmit isLoading={isLoading} loadingText="Signing in…">
        Sign in
      </AuthSubmit>
    </form>
  );
}
