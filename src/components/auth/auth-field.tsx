"use client";

import { forwardRef, useId } from "react";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { FieldError } from "@/components/ui/FieldError";
import { cn } from "@/lib/utils";

interface AuthFieldProps extends React.ComponentProps<"input"> {
  label: string;
  error?: string;
}

/**
 * Labeled input + inline error for the auth forms, styled to the console
 * look. Forwards the ref so react-hook-form's `register` spread works.
 * `type="password"` automatically gets the show/hide visibility toggle.
 */
export const AuthField = forwardRef<HTMLInputElement, AuthFieldProps>(
  function AuthField({ label, error, className, type, ...props }, ref) {
    const id = useId();
    const errorId = `${id}-error`;
    const inputClass = cn(
      "h-9 border-slate-300 bg-white text-[14px] focus-visible:border-console focus-visible:ring-console/25",
      className,
    );
    const shared = {
      id,
      ref,
      "aria-invalid": Boolean(error),
      "aria-describedby": error ? errorId : undefined,
      className: inputClass,
      ...props,
    };
    return (
      <div className="grid gap-1.5">
        <label
          htmlFor={id}
          className="text-[12.5px] font-semibold text-slate-700"
        >
          {label}
        </label>
        {type === "password" ? (
          <PasswordInput {...shared} />
        ) : (
          <Input type={type} {...shared} />
        )}
        <FieldError id={errorId} message={error} />
      </div>
    );
  },
);
