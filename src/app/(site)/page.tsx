import { AvailabilityBoard } from "@/components/home/availability-board";
import { BusinessLines } from "@/components/home/business-lines";
import { CtaCall } from "@/components/home/cta-call";
import { Hero } from "@/components/home/hero";
import { PaperTrail } from "@/components/home/paper-trail";
import { TrustStrip } from "@/components/home/trust-strip";
import { WaybillSteps } from "@/components/home/waybill-steps";
import { WhyUs } from "@/components/home/why-us";
import {
  fetchPublicCommodities,
  toBoardLines,
} from "@/lib/public-commodities";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Bulk grain trading from Tamale",
  description: siteConfig.description,
  path: "/",
  keywords: [...siteConfig.keywords],
});

export default async function HomePage() {
  // Live availability with a 5-minute ISR window; the fetch failing (or
  // nothing published yet) falls back to the static board lines, so the
  // page never renders bare or 500s because the API is down.
  const lines = toBoardLines(await fetchPublicCommodities());
  const updatedOn = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return (
    <>
      <Hero />
      <AvailabilityBoard updatedOn={updatedOn} lines={lines} />
      <div className="texture-grain bg-surface">
        <TrustStrip />
        <WaybillSteps />
        <BusinessLines />
      </div>
      <PaperTrail />
      <WhyUs />
      <CtaCall />
    </>
  );
}
