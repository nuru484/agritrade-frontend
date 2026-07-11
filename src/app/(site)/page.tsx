import { AvailabilityBoard } from "@/components/home/availability-board";
import { BusinessLines } from "@/components/home/business-lines";
import { CtaCall } from "@/components/home/cta-call";
import { Hero } from "@/components/home/hero";
import { PaperTrail } from "@/components/home/paper-trail";
import { TrustStrip } from "@/components/home/trust-strip";
import { WaybillSteps } from "@/components/home/waybill-steps";
import { WhyUs } from "@/components/home/why-us";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Bulk grain trading from Tamale",
  description: siteConfig.description,
  path: "/",
  keywords: [...siteConfig.keywords],
});

// The availability board's "Updated …" line reflects when the stock lines in
// static-data were last shipped — i.e. this build. It becomes the API's
// timestamp when the warehouse records endpoint arrives.
const updatedOn = new Date().toLocaleDateString("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export default function HomePage() {
  return (
    <>
      <Hero />
      <AvailabilityBoard updatedOn={updatedOn} />
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
