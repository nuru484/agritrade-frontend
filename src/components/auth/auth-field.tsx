"use client";

import { forwardRef, useId } from "react";
import { adminInputClass } from "@/components/admin/ui";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { FieldError } from "@/components/ui/FieldError";
import { cn } from "@/lib/utils";

interface AuthFieldProps extends React.ComponentProps<"input"> {
  label: string;
  error?: string;
}

/**
 * Labeled input + inline error for the auth forms, in the document field
 * idiom shared with the site's enquiry form and the console forms. Forwards
 * the ref so react-hook-form's `register` spread works. `type="password"`
 * automatically gets the show/hide visibility toggle.
 */
export const AuthField = forwardRef<HTMLInputElement, AuthFieldProps>(
  function AuthField({ label, error, className, type, ...props }, ref) {
    const id = useId();
    const errorId = `${id}-error`;
    const inputClass = cn(adminInputClass, className);
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
          className="stencil text-[11px] uppercase tracking-[0.14em] text-harvest-deep"
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
