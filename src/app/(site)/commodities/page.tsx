import { BoardHeader } from "@/components/commodities/board-header";
import { EmptyLots } from "@/components/commodities/empty-lots";
import { LotFiles } from "@/components/commodities/lot-files";
import {
  fetchPublicCommodities,
  toBoardLines,
  toLots,
} from "@/lib/public-commodities";
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

export default async function CommoditiesPage() {
  // One live read feeds both the planks and the lot files, cached under the
  // `commodities` tag - the backend purges it on every stock/register write,
  // so the board follows the records within seconds. Nothing published (or
  // the API briefly down) renders the designed empty board, never stand-ins.
  const commodities = await fetchPublicCommodities();
  const lines = toBoardLines(commodities);
  const lots = toLots(commodities);
  const updatedOn = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return (
    <div className="texture-grain bg-surface">
      <BoardHeader updatedOn={updatedOn} lines={lines} />
      {lots.length === 0 ? <EmptyLots /> : <LotFiles lots={lots} />}
    </div>
  );
}
