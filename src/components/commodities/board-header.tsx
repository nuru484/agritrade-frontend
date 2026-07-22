import { PlankRows } from "@/components/shared/plank-rows";
import { StencilLabel } from "@/components/ui/StencilLabel";
import type { CommodityLine } from "@/static-data/availability";

/** The commodities page opens ON the board — eyebrow, H1 and the planks.
 * Same restraint as the home board: forest (not board-black) and a single
 * caption line under the planks, no extra button rows. */
export function BoardHeader({
  updatedOn,
  lines,
}: {
  updatedOn: string;
  lines: CommodityLine[];
}) {
  return (
    <section
      aria-label="The board — commodity availability"
      className="texture-grain-dark mt-6 bg-forest px-5 pb-9 pt-10 lg:mt-[34px] lg:px-0 lg:pt-14"
    >
      <div className="mx-auto max-w-[1312px] lg:px-8">
        <div className="mb-5 flex flex-col justify-between gap-4 lg:mb-[22px] lg:flex-row lg:items-end lg:gap-10">
          <div>
            <StencilLabel className="text-[11px] tracking-[0.32em] text-harvest lg:text-[12px]">
              THE BOARD
            </StencilLabel>
            <h1 className="mt-3 font-display text-[32px] font-bold leading-[1.1] text-surface lg:text-[52px] lg:leading-[1.05]">
              What&rsquo;s in the warehouse today.
            </h1>
          </div>
          <div className="flex items-center gap-2.5 lg:pb-2.5">
            <span
              aria-hidden="true"
              className="h-[9px] w-[9px] flex-none rounded-full bg-harvest shadow-[0_0_0_4px_rgb(216_156_46/0.2)]"
            />
            <span className="text-[12px] font-medium text-surface/70 lg:whitespace-nowrap lg:text-[13px]">
              Updated {updatedOn} · from our stock records
            </span>
          </div>
        </div>

        <PlankRows lines={lines} />

        <p className="mt-4 max-w-[72ch] text-[12.5px] leading-[1.6] text-surface/70">
          Other grains &amp; pulses on request. No prices, no stock figures
          posted — the market moves daily; call with tonnage and destination
          for a same-day quote.
        </p>
      </div>
    </section>
  );
}
