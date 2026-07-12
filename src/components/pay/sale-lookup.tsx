"use client";

import { useState } from "react";
import { AlertCircle, Check } from "lucide-react";
import { DocCard } from "@/components/ui/DocCard";
import { Stamp } from "@/components/ui/Stamp";
import { extractApiError } from "@/lib/extract-api-error";
import { formatMoney } from "@/lib/format-money";
import { siteConfig } from "@/lib/site";
import {
  useLazyGetSaleQuery,
  usePaySaleMutation,
} from "@/redux/sales/sales-api";
import type { ISale } from "@/types/sale.types";

type View =
  | { kind: "idle" }
  | { kind: "notfound" }
  | { kind: "outstanding"; sale: ISale }
  | { kind: "settled"; sale: ISale }
  | { kind: "paid"; sale: ISale }
  | { kind: "failed"; sale: ISale; message: string };

/** The ruled-paper backdrop the paid/failed stamps sit on. */
function RuledPaper({ children }: { children: React.ReactNode }) {
  return (
    <div
      aria-hidden="true"
      className="relative mb-5 h-[110px] bg-[repeating-linear-gradient(180deg,transparent_0px,transparent_27px,rgb(89_82_59/0.25)_27px,rgb(89_82_59/0.25)_28px)]"
    >
      {children}
    </div>
  );
}

/**
 * The payment counter: reference in → one of the design's states out
 * (not found / outstanding / settled / paid / failed), all worn as filed
 * paperwork. In production the pay step hands off to Hubtel via
 * `authorizationUrl`; the stand-in settles immediately.
 */
export function SaleLookup() {
  const [reference, setReference] = useState("");
  const [view, setView] = useState<View>({ kind: "idle" });
  const [lookup, { isFetching: looking }] = useLazyGetSaleQuery();
  const [paySale, { isLoading: paying }] = usePaySaleMutation();

  const onLookup = async () => {
    const ref = reference.trim().toUpperCase();
    if (!ref) return;
    try {
      const res = await lookup(ref).unwrap();
      setView(
        res.data.status === "OUTSTANDING"
          ? { kind: "outstanding", sale: res.data }
          : { kind: "settled", sale: res.data },
      );
    } catch {
      // Any lookup failure reads as "not on record" — the design's one
      // honest answer here; the caller can always phone the office.
      setView({ kind: "notfound" });
    }
  };

  const onPay = async (sale: ISale) => {
    try {
      const res = await paySale(sale.reference).unwrap();
      if (res.data.authorizationUrl) {
        // Real backend: continue on Hubtel.
        window.location.assign(res.data.authorizationUrl);
        return;
      }
      setView({ kind: "paid", sale });
    } catch (err) {
      setView({ kind: "failed", sale, message: extractApiError(err).message });
    }
  };

  return (
    <DocCard title="PAYMENT COUNTER" fileNo="N° PAY-01" tint="paper">
      <div className="px-6 pb-7 pt-6 sm:px-8">
        <label
          htmlFor="sale-reference"
          className="stencil mb-2 block text-[11px] tracking-[0.14em] text-harvest-deep"
        >
          Sale reference
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="sale-reference"
            value={reference}
            onChange={(e) => setReference(e.target.value.toUpperCase())}
            onKeyDown={(e) => {
              if (e.key === "Enter") void onLookup();
            }}
            placeholder="e.g. NA-1042"
            className="min-w-0 flex-1 rounded-[2px] border-[1.5px] border-soil/35 bg-[#FBFCF7] px-3.5 py-3.5 text-[16px] font-semibold uppercase tracking-[0.06em] text-ink outline-none transition-[border-color,box-shadow] placeholder:font-normal placeholder:normal-case placeholder:text-soil/55 focus:border-leaf focus:shadow-[0_0_0_3px_rgb(62_125_98/0.16)]"
          />
          <button
            type="button"
            onClick={() => void onLookup()}
            disabled={looking}
            className="shadow-doc-sm cursor-pointer rounded-[2px] border-2 border-forest bg-forest px-7 py-3 text-[15px] font-bold text-surface transition-[transform,box-shadow] duration-100 hover:translate-x-px hover:translate-y-px hover:shadow-[2px_2px_0_rgb(89_82_59/0.4)] disabled:opacity-60"
          >
            {looking ? "Finding…" : "Find"}
          </button>
        </div>
        <p className="mb-0 mt-2.5 text-[12.5px] leading-[1.55] text-soil">
          The reference is printed on your invoice or receipt — e.g.{" "}
          <span className="font-semibold text-ink">NA-1042</span>.
        </p>

        {view.kind === "notfound" ? (
          <div
            role="status"
            className="mt-6 flex gap-3 rounded-[2px] border border-error/40 bg-error/6 px-5 py-[18px]"
          >
            <AlertCircle
              aria-hidden="true"
              className="mt-px size-[18px] flex-none text-error"
              strokeWidth={2}
            />
            <div>
              <span className="mb-[3px] block text-[14px] font-bold text-error">
                Reference not found.
              </span>
              <span className="text-[13px] leading-[1.55] text-soil">
                Check the reference on your invoice, or call us on{" "}
                {siteConfig.phone} and we&rsquo;ll find it for you.
              </span>
            </div>
          </div>
        ) : null}

        {view.kind === "outstanding" ? (
          <div className="shadow-doc-sm mt-6 border border-soil/30">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b-[1.5px] border-soil/50 bg-surface-alt px-5 py-3.5">
              <span className="stencil text-[11px] tracking-[0.2em] text-harvest-deep">
                SALE {view.sale.reference}
              </span>
              <span className="text-[13px] font-semibold text-forest">
                {view.sale.seller}
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-4 border-b border-dotted border-soil/40 px-5 py-[18px]">
              <span className="text-[14px] font-medium text-soil">
                Amount outstanding
              </span>
              <span className="font-display text-[24px] font-bold text-forest lg:text-[28px]">
                {formatMoney(view.sale.amountOutstanding)}
              </span>
            </div>
            <div className="px-5 pb-5 pt-[18px]">
              <button
                type="button"
                onClick={() => void onPay(view.sale)}
                disabled={paying}
                className="shadow-block w-full cursor-pointer rounded-[2px] bg-harvest p-4 text-[16px] font-bold text-ink transition-[transform,box-shadow] duration-100 hover:translate-x-px hover:translate-y-px hover:shadow-[2px_2px_0_#1F211C] disabled:opacity-60"
              >
                {paying ? "Starting payment…" : "Pay with Hubtel"}
              </button>
              <p className="mb-0 mt-2.5 text-center text-[12px] leading-[1.5] text-soil">
                You&rsquo;ll be taken to Hubtel to complete payment by mobile
                money or card.
              </p>
            </div>
          </div>
        ) : null}

        {view.kind === "settled" ? (
          <div
            role="status"
            className="mt-6 flex gap-3 rounded-[2px] border border-leaf/45 bg-leaf/8 px-5 py-[18px]"
          >
            <Check
              aria-hidden="true"
              className="mt-px size-[18px] flex-none text-leaf"
              strokeWidth={2.2}
            />
            <div>
              <span className="mb-[3px] block text-[14px] font-bold text-forest">
                Nothing outstanding on {view.sale.reference}.
              </span>
              <span className="text-[13px] leading-[1.55] text-soil">
                This sale is fully paid. If you were expecting a balance, call
                us and we&rsquo;ll check the records together.
              </span>
            </div>
          </div>
        ) : null}

        {view.kind === "paid" ? (
          <div
            role="status"
            className="shadow-doc-sm mt-6 border border-soil/30 px-6 pb-7 pt-6 text-center"
          >
            <RuledPaper>
              <Stamp className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap border-[3px] px-5 py-[11px] text-[19px]">
                Paid in full
              </Stamp>
            </RuledPaper>
            <h2 className="mb-2 font-display text-[22px] font-bold text-forest">
              Payment received.
            </h2>
            <p className="mx-auto max-w-[42ch] text-[14px] leading-[1.6] text-soil">
              {formatMoney(view.sale.amountOutstanding)} paid on sale{" "}
              {view.sale.reference}. A receipt has been sent by SMS and email.
              Thank you
              for your business.
            </p>
          </div>
        ) : null}

        {view.kind === "failed" ? (
          <div
            role="alert"
            className="shadow-doc-sm mt-6 border border-soil/30 px-6 pb-7 pt-6 text-center"
          >
            <RuledPaper>
              <Stamp
                tone="error"
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap border-[3px] px-5 py-[11px] text-[19px]"
              >
                Not processed
              </Stamp>
            </RuledPaper>
            <h2 className="mb-2 font-display text-[22px] font-bold text-forest">
              Payment didn&rsquo;t go through.
            </h2>
            <p className="mx-auto mb-[18px] max-w-[42ch] text-[14px] leading-[1.6] text-soil">
              No money left your account. Check your network or balance and try
              again — or call us and pay another way.
            </p>
            <button
              type="button"
              onClick={() => setView({ kind: "outstanding", sale: view.sale })}
              className="shadow-block cursor-pointer rounded-[2px] bg-harvest px-[26px] py-[13px] text-[15px] font-bold text-ink transition-[transform,box-shadow] duration-100 hover:translate-x-px hover:translate-y-px hover:shadow-[2px_2px_0_#1F211C]"
            >
              Try again
            </button>
          </div>
        ) : null}
      </div>
    </DocCard>
  );
}
