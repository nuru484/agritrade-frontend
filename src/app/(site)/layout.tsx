import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { StickyCallBar } from "@/components/layout/sticky-call-bar";

/**
 * The standard site chrome. /pay deliberately lives outside this group — the
 * design strips it to a minimal "SECURE PAYMENT" header with no nav so
 * nothing pulls attention away from the payment.
 */
export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <StickyCallBar />
    </>
  );
}
