"use client";

import { forwardRef, useId } from "react";
import { Input } from "@/components/ui/input";
import { FieldError } from "@/components/ui/FieldError";
import { cn } from "@/lib/utils";

interface AuthFieldProps extends React.ComponentProps<"input"> {
  label: string;
  error?: string;
}

/**
 * Labeled input + inline error for the auth forms, styled to the console
 * look. Forwards the ref so react-hook-form's `register` spread works.
 */
export const AuthField = forwardRef<HTMLInputElement, AuthFieldProps>(
  function AuthField({ label, error, className, ...props }, ref) {
    const id = useId();
    const errorId = `${id}-error`;
    return (
      <div className="grid gap-1.5">
        <label
          htmlFor={id}
          className="text-[12.5px] font-semibold text-slate-700"
        >
          {label}
        </label>
        <Input
          id={id}
          ref={ref}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "h-9 border-slate-300 bg-white text-[14px] focus-visible:border-console focus-visible:ring-console/25",
            className,
          )}
          {...props}
        />
        <FieldError id={errorId} message={error} />
      </div>
    );
  },
);
