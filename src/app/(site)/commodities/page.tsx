import { BoardHeader } from "@/components/commodities/board-header";
import { LotFiles } from "@/components/commodities/lot-files";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Commodities — the board",
  description:
    "Maize, soya beans and groundnuts by the truckload from Tamale — graded, bagged and weighed over a certified scale. See what's in the warehouse today.",
  path: "/commodities",
  keywords: [
    "maize by the truckload",
    "soya beans supplier Ghana",
    "groundnuts Tamale",
    "bulk grain availability",
  ],
});

// "Updated …" reflects when the stock lines in static-data last shipped —
// i.e. this build. Becomes the API's timestamp when warehouse records arrive.
const updatedOn = new Date().toLocaleDateString("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export default function CommoditiesPage() {
  return (
    <div className="texture-grain bg-surface">
      <BoardHeader updatedOn={updatedOn} />
      <LotFiles />
    </div>
  );
}
