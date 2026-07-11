/**
 * The plot register. Hand-maintained for now — becomes an admin-managed API
 * read later. Design rules: the price line is a PER-PLOT opt-in (omit `price`
 * to show no figure), and an empty register renders the "NO PLOTS ON FILE"
 * ledger page, never a blank grid.
 */
export type PlotStatus = "AVAILABLE" | "RESERVED";

export interface Plot {
  ref: string;
  name: string;
  size: string;
  use: string;
  /** Minor units (pesewas). Omit to keep the price off the public page. */
  price?: number;
  papers: string;
  status: PlotStatus;
  photo: string;
  photoAlt: string;
}

export const plotRegister: Plot[] = [
  {
    ref: "TML-014",
    name: "Kumbungu Road, Plot 14",
    size: "100 × 100 ft",
    use: "residential",
    price: 4_500_000,
    papers: "Site plan + indenture on file",
    status: "AVAILABLE",
    photo:
      "https://commons.wikimedia.org/wiki/Special:FilePath/A%20green%20farm%20lands%20in%20northern%20ghana.jpg?width=1000",
    photoAlt: "Green farmland on Kumbungu Road, northern Ghana",
  },
  {
    ref: "TML-008",
    name: "Nyankpala Road, Plot 8",
    size: "100 × 100 ft",
    use: "residential",
    papers: "Site plan + indenture on file",
    status: "RESERVED",
    photo:
      "https://commons.wikimedia.org/wiki/Special:FilePath/A%20prepared%20pepper%20farm%20in%20northern%20ghana.jpg?width=1000",
    photoAlt: "Prepared farmland on Nyankpala Road, northern Ghana",
  },
];
