import { SaleLookup } from "@/components/pay/sale-lookup";
import { DocCard } from "@/components/ui/DocCard";
import { StencilLabel } from "@/components/ui/StencilLabel";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Make a payment",
  description:
    "Use the sale reference on your invoice or receipt to make a secure payment to Nasara Agro Trading Ltd by mobile money or card, processed by Hubtel.",
  path: "/pay",
  // Transactional page — no search value (khadys cart precedent).
  index: false,
});

const HOW_IT_WORKS = [
  {
    no: "01",
    title: "Find your reference",
    body: "It's printed on your invoice or receipt — a short code like NA-1042.",
  },
  {
    no: "02",
    title: "Check what's outstanding",
    body: "The balance comes straight from the sale's record at the office.",
  },
  {
    no: "03",
    title: "Pay securely with Hubtel",
    body: "Mobile money or card. Your receipt arrives by SMS and email the moment payment lands.",
  },
];

export default function PayPage() {
  return (
    <div className="texture-grain relative overflow-x-clip bg-surface">
      <span
        aria-hidden="true"
        className="stencil absolute -right-10 top-14 z-0 select-none whitespace-nowrap text-[96px] leading-none tracking-[0.02em] text-soil/12 lg:-right-24 lg:top-4 lg:text-[220px]"
      >
        RECEIPT
      </span>

      <div className="relative z-[2] mx-auto max-w-[1312px] px-5 pt-9 lg:px-8 lg:pt-[76px]">
        <div className="mb-4 flex items-center gap-2.5">
          <span aria-hidden="true" className="h-0.5 w-[22px] bg-harvest" />
          <StencilLabel className="text-[11px] tracking-[0.3em] lg:text-[12px]">
            OFFICE · SECURE PAYMENT
          </StencilLabel>
        </div>
        <h1 className="mb-3 font-display text-[30px] font-bold leading-[1.1] tracking-[-0.015em] text-forest lg:mb-3.5 lg:text-[52px] lg:leading-[1.05]">
          Pay for your purchase.
        </h1>
        <p className="mb-9 max-w-[56ch] text-[14px] leading-[1.65] text-soil lg:mb-10 lg:text-[16px]">
          Use the sale reference on your invoice or receipt to make a secure
          payment by mobile money or card.
        </p>
      </div>

      <div className="relative z-[2] mx-auto grid max-w-[1312px] items-start gap-10 px-5 pb-16 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-14 lg:px-8 lg:pb-24">
        <div className="flex flex-col gap-[22px]">
          <SaleLookup />
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2.5 border border-dashed border-soil/45 px-5 py-4">
            <StencilLabel className="text-[10px] tracking-[0.24em]">
              WE ACCEPT
            </StencilLabel>
            {["MTN MoMo", "Telecel Cash", "AT Money", "Visa / Mastercard", "Bank transfer"].map(
              (method) => (
                <span
                  key={method}
                  className="rounded-[2px] border border-soil/35 px-2.5 py-1.5 text-[11.5px] font-semibold tracking-[0.04em] text-ink"
                >
                  {method}
                </span>
              ),
            )}
            <span className="text-[12px] text-soil">
              Receipt by SMS &amp; email on every payment.
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-[22px]">
          <DocCard title="HOW IT WORKS" fileNo="3 STEPS">
            {HOW_IT_WORKS.map((step, i) => (
              <div
                key={step.no}
                className={`flex gap-4 px-6 py-4 sm:px-8 ${
                  i < HOW_IT_WORKS.length - 1
                    ? "border-b border-dotted border-soil/40"
                    : ""
                }`}
              >
                <span className="stencil pt-0.5 text-[13px] tracking-[0.1em] text-harvest-deep">
                  {step.no}
                </span>
                <div>
                  <h2 className="mb-1 font-display text-[15px] font-semibold text-forest">
                    {step.title}
                  </h2>
                  <p className="text-[13px] leading-[1.6] text-soil">
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
            <div className="border-t-[1.5px] border-soil/50 px-6 py-4 sm:px-8">
              <p className="text-[12.5px] leading-[1.6] text-soil">
                Prefer to pay in person or by bank transfer? Call the office
                and we&rsquo;ll take you through it — every payment is
                receipted the same way.
              </p>
            </div>
          </DocCard>

          <div className="grid grid-cols-2 gap-4">
            <a
              href={siteConfig.phoneHref}
              className="texture-grain-dark flex flex-col items-center gap-[7px] rounded-[2px] bg-forest px-3 py-[22px] text-surface shadow-[4px_4px_0_rgb(31_33_28/0.3)] transition-[transform,box-shadow] duration-100 hover:translate-x-px hover:translate-y-px hover:shadow-[3px_3px_0_rgb(31_33_28/0.3)]"
            >
              <span className="stencil text-[10px] tracking-[0.24em] text-harvest">
                QUESTIONS?
              </span>
              <span className="font-display text-[17px] font-bold">Call us</span>
              <span className="text-[12px] font-medium text-surface/75">
                Mon–Sat, 7:00–17:00
              </span>
            </a>
            <a
              href={siteConfig.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-[7px] rounded-[2px] bg-leaf px-3 py-[22px] text-surface shadow-[4px_4px_0_rgb(31_33_28/0.3)] transition-[transform,box-shadow] duration-100 hover:translate-x-px hover:translate-y-px hover:shadow-[3px_3px_0_rgb(31_33_28/0.3)]"
            >
              <span className="stencil text-[10px] tracking-[0.24em] text-surface/80">
                SAME NUMBER
              </span>
              <span className="flex items-center gap-2 font-display text-[17px] font-bold">
                <WhatsAppIcon aria-hidden="true" className="size-[17px]" />
                WhatsApp
              </span>
              <span className="text-[12px] font-medium text-surface/75">
                {siteConfig.phone}
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
