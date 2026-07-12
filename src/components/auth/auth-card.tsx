import Link from "next/link";
import type { ReactNode } from "react";

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  /** Footer link row under the card. Defaults to a "← Back to site" link. */
  footer?: ReactNode;
}

/**
 * Shared brand shell for the auth screens (sign in, forgot / reset password):
 * a centered card on the console page with the Nasara wordmark, a title +
 * subtitle, the form, and a footer link. Presentational only — no client
 * state — so it renders on the server for the forgot/reset pages and
 * client-side inside the login card.
 */
export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <main className="grid min-h-screen place-items-center bg-console-page px-[clamp(20px,5vw,48px)] py-16 text-slate-900">
      <div className="w-full max-w-[400px]">
        <div className="mb-8 text-center">
          <Link href="/" className="no-underline">
            <span className="text-[19px] font-extrabold tracking-[0.14em] text-console">
              NASARA
            </span>
          </Link>
          <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            Management console
          </div>
        </div>

        <div className="rounded-[10px] border border-slate-200 bg-white p-[clamp(24px,4vw,32px)]">
          <h1 className="mb-1.5 text-[20px] font-bold text-slate-900">
            {title}
          </h1>
          <p className="mb-6 text-[13.5px] leading-[1.6] text-slate-500">
            {subtitle}
          </p>
          {children}
        </div>

        <p className="mt-6 text-center text-[13px] text-slate-500">
          {footer ?? (
            <Link
              href="/"
              className="font-semibold text-slate-600 no-underline transition-colors hover:text-console"
            >
              ← Back to site
            </Link>
          )}
        </p>
      </div>
    </main>
  );
}
