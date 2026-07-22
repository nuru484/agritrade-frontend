/** Shared field-form primitives - plain elements, no heavy UI kit, so the
 * agent bundle stays small on slow connections. */

export const agentInputClass =
  "w-full rounded border border-soil/35 bg-paper px-3 py-2.5 text-[16px] text-ink outline-none placeholder:text-soil/50 focus:border-forest";

export function AgentLabel({
  htmlFor,
  optional = false,
  children,
}: {
  htmlFor?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1 block text-[12px] font-semibold text-soil"
    >
      {children}
      {optional ? (
        <span className="ml-1 font-normal text-soil/60">(optional)</span>
      ) : null}
    </label>
  );
}

export function AgentFieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1 text-[12px] font-medium text-error">
      {message}
    </p>
  );
}

/** Submit-level failure, phrased for retry (the draft is still on-device). */
export function AgentSubmitError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="rounded border border-error/40 bg-error/[0.06] px-3 py-2.5 text-[13px] text-error"
    >
      <p className="font-semibold">Not sent yet</p>
      <p>{message}</p>
      <p className="mt-0.5 text-[12px]">
        Your entry is still saved on this phone - fix the issue or try again.
      </p>
    </div>
  );
}
