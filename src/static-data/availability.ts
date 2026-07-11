/**
 * The availability board's stock lines. Hand-maintained for now — when the
 * warehouse records API ships, this becomes an RTK Query read and the board
 * flips to live data without a layout change.
 *
 * Design rule: a commodity never disappears from the board; it degrades from
 * the gold "AVAILABLE NOW" tag to the dashed "ASK US".
 */
export interface CommodityLine {
  name: string;
  available: boolean;
  /** One line of market context shown under the name on desktop planks. */
  meta: string;
}

export const availabilityBoard: CommodityLine[] = [
  { name: "Maize", available: true, meta: "Main harvest from September" },
  { name: "Soya beans", available: true, meta: "Aggregating through December" },
  { name: "Groundnuts", available: false, meta: "Sourced against firm orders" },
];

/** The commodities page's lot files — one document per traded commodity. */
export interface CommodityLot {
  name: string;
  /** Board line this lot's stamp follows (must match availabilityBoard). */
  boardName: string;
  lotNo: string;
  /** The cropped ghost stencil word behind the row. */
  ghost: string;
  grades: string;
  season: string;
  soldAs: string;
  photo: string;
  photoAlt: string;
  /** Contact prefill subject for the enquiry CTA. */
  subject: string;
}

export const commodityLots: CommodityLot[] = [
  {
    name: "Maize",
    boardName: "Maize",
    lotNo: "LOT-01",
    ghost: "MAIZE",
    grades: "White and yellow, dried to trade moisture, cleaned",
    season: "Main harvest from September; stocks run through the dry season",
    soldAs: "Full truckloads, bagged and weighed over a certified scale",
    photo:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Grains%20market%20at%20Dan%20Daura%20village%2C%20Kaduna%20State%2001.jpg?width=1000",
    photoAlt: "Sacks of grain stacked at a grains market",
    subject: "Maize",
  },
  {
    name: "Soya beans",
    boardName: "Soya beans",
    lotNo: "LOT-02",
    ghost: "SOYA",
    grades: "Clean, well-dried soya for crushers and feed mills",
    season: "Harvest from late October; steady aggregation through December",
    soldAs: "Full truckloads, bagged and weighed over a certified scale",
    photo:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Yellow%20corn%20and%20soya%20beans%20good%20for%20nutrition.jpg?width=1000",
    photoAlt: "Yellow corn and soya beans",
    subject: "Soya beans",
  },
  {
    name: "Groundnuts",
    boardName: "Groundnuts",
    lotNo: "LOT-03",
    ghost: "G-NUTS",
    grades: "Shelled and in-shell, hand-sorted",
    season:
      "Seasonal — when the board says ask us, we source against firm orders",
    soldAs: "Full truckloads, bagged and weighed over a certified scale",
    photo:
      "https://commons.wikimedia.org/wiki/Special:FilePath/A%20mother%20and%20her%20children%20harvest%20groundnuts%20in%20the%20farm%20in%20northern%20Ghana.jpg?width=1000",
    photoAlt: "Harvesting groundnuts on a farm in northern Ghana",
    subject: "Groundnuts",
  },
];

export const sourcingDistricts = [
  "Tamale Metro",
  "Savelugu",
  "Kumbungu",
  "Tolon",
  "Mion",
  "Yendi",
  "Karaga",
  "Gushegu",
] as const;
