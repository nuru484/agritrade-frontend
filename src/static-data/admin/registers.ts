import type { Tone } from "@/components/admin/ui";

/**
 * The config-driven registers (from the DB Plus Console design): 13 modules
 * share one list template, one detail template and one form template. Each
 * entry mirrors the design's `regCfg()` plus its `seedRegRows()` stub data.
 * Custom screens (purchases, sales, shipments…) have their own routes and are
 * deliberately NOT in this record.
 */

/** One column of a register table. */
export interface RegisterHeader {
  /** Column label. */
  l: string;
  align?: "left" | "right";
  /** Money column — right-aligned mono, GH₵-prefixed in forms. */
  money?: boolean;
  /** Status column rendered as a tone chip. */
  tag?: boolean;
  /** Secondary column, hidden below the xl breakpoint. */
  wide?: boolean;
}

/** Status cell: tone-chip text. */
export interface RegisterTagCell {
  t: string;
  tone: Tone;
}

/** Text cell with an accent colour and/or weight (negative floats, estimates). */
export interface RegisterStyledCell {
  t: string;
  c?: string;
  w?: number;
}

export type RegisterCell = string | number | RegisterStyledCell | RegisterTagCell;
export type RegisterRow = RegisterCell[];

export interface RegisterLedgerRow {
  date: string;
  desc: string;
  amount: string;
  amtColor: string;
  after: string;
}

/** Optional per-record movement card on the detail screen. */
export interface RegisterLedger {
  title: string;
  rows: RegisterLedgerRow[];
}

export interface RegisterConfig {
  title: string;
  sub: string;
  /** Singular noun ("Lot", "Agent") for detail and form titles. */
  single: string;
  /** Add-button label, or null when records can't be created here. */
  add: string | null;
  search: string;
  /** Filter dropdowns (visual until the backend lands). */
  filters: string[];
  /** Tag a newly created row would wear. */
  newTag: RegisterTagCell | null;
  headers: RegisterHeader[];
  /** Header indexes surfaced as big figures on the detail screen. */
  figs: number[];
  ledger: RegisterLedger | null;
  /** First column renders with an initials avatar. */
  avatar?: boolean;
  /** No add / edit / delete (audit log). */
  readOnly?: boolean;
}

export type RegisterSlug =
  | "stock"
  | "agents"
  | "expenses"
  | "plots"
  | "land-sales"
  | "seasons"
  | "farmers"
  | "grants"
  | "repayments";

export const REGISTERS: Record<RegisterSlug, RegisterConfig & { rows: RegisterRow[] }> = {
  stock: {
    title: "Stock",
    sub: "On-hand inventory by lot and warehouse",
    single: "Lot",
    add: "+ Stock adjustment",
    search: "Search lot or commodity…",
    filters: ["Commodity", "Warehouse"],
    newTag: { t: "Available", tone: "leaf" },
    headers: [
      { l: "Lot" },
      { l: "Commodity" },
      { l: "Warehouse", wide: true },
      { l: "Weight", align: "right" },
      { l: "Cost/kg", align: "right", money: true, wide: true },
      { l: "Value", align: "right", money: true },
      { l: "Status", tag: true },
    ],
    figs: [3, 4, 5],
    ledger: {
      title: "Stock movements",
      rows: [
        { date: "10 Jul 2026", desc: "Received from P-0891", amount: "+12,400 kg", amtColor: "#2F5E3D", after: "12,400 kg" },
        { date: "10 Jul 2026", desc: "Allocated to SH-0119", amount: "−12,400 kg", amtColor: "#B03A2E", after: "0 kg free" },
      ],
    },
    rows: [
      ["LOT-0455", "Maize (white)", "Main WH, Tamale", "12,400 kg", "4.20", "GH₵ 52,080", { t: "Allocated", tone: "sky" }],
      ["LOT-0442", "Maize (white)", "Main WH, Tamale", "8,000 kg", "4.15", "GH₵ 33,200", { t: "Allocated", tone: "sky" }],
      ["LOT-0431", "Maize (white)", "Savelugu Depot", "7,600 kg", { t: "~4.10", c: "#7A5407" }, { t: "~GH₵ 31,160", c: "#7A5407" }, { t: "Estimated", tone: "harvest" }],
      ["LOT-0428", "Soybeans", "Main WH, Tamale", "9,450 kg", "6.78", "GH₵ 64,071", { t: "Available", tone: "leaf" }],
      ["LOT-0419", "Shea nuts", "Walewale Store", "12,800 kg", "5.07", "GH₵ 64,896", { t: "Available", tone: "leaf" }],
      ["LOT-0412", "Groundnuts", "Main WH, Tamale", "2,240 kg", "7.50", "GH₵ 16,800", { t: "Reserved", tone: "harvest" }],
    ],
  },
  agents: {
    avatar: true,
    title: "Agents & Floats",
    sub: "Field agents, their cash floats and activity",
    single: "Agent",
    add: "+ Add agent",
    search: "Search agent…",
    filters: ["Status"],
    newTag: { t: "Active", tone: "leaf" },
    headers: [
      { l: "Agent" },
      { l: "Phone", wide: true },
      { l: "Float", align: "right", money: true },
      { l: "Buys 30d", align: "right", wide: true },
      { l: "Volume 30d", align: "right" },
      { l: "Status", tag: true },
    ],
    figs: [2, 4],
    ledger: {
      title: "Float ledger",
      rows: [
        { date: "10 Jul 2026", desc: "Purchase P-0891 — maize, Savelugu", amount: "−GH₵ 52,080.00", amtColor: "#B03A2E", after: "GH₵ 1,240.00" },
        { date: "05 Jul 2026", desc: "Float top-up — bank transfer", amount: "+GH₵ 30,000.00", amtColor: "#2F5E3D", after: "GH₵ 53,320.00" },
        { date: "03 Jul 2026", desc: "Expense — fuel, Tolon round", amount: "−GH₵ 420.00", amtColor: "#B03A2E", after: "GH₵ 23,320.00" },
      ],
    },
    rows: [
      ["Ibrahim Fuseini", "024 556 8841", "GH₵ 1,240.00", "18", "38,400 kg", { t: "Active", tone: "leaf" }],
      ["Salifu Issahaku", "020 771 2204", { t: "−GH₵ 480.00", c: "#B03A2E", w: 600 }, "14", "29,150 kg", { t: "Fronted", tone: "alert" }],
      ["Yakubu Mohammed", "055 302 9917", "GH₵ 2,905.00", "9", "13,940 kg", { t: "Active", tone: "leaf" }],
      ["Fuseina Alhassan", "024 118 6630", "GH₵ 12,455.00", "12", "21,300 kg", { t: "Active", tone: "leaf" }],
      ["Musah Wumpini", "026 447 1029", "GH₵ 0.00", "0", "0 kg", { t: "Inactive", tone: "slate" }],
    ],
  },
  expenses: {
    title: "Expenses",
    sub: "Operating costs across trucks, warehouses and agents",
    single: "Expense",
    add: "+ Record expense",
    search: "Search description…",
    filters: ["Category", "Status"],
    newTag: { t: "Pending", tone: "harvest" },
    headers: [
      { l: "Ref" },
      { l: "Date" },
      { l: "Category", wide: true },
      { l: "Description" },
      { l: "Amount", align: "right", money: true },
      { l: "Status", tag: true },
    ],
    figs: [4],
    ledger: null,
    rows: [
      ["E-0231", "10 Jul 2026", "Transport", "Fuel — SH-0119 Tamale → Tema", "GH₵ 1,850.00", { t: "Approved", tone: "leaf" }],
      ["E-0230", "09 Jul 2026", "Repairs", "Brake pads — GT 5482-22", "GH₵ 850.00", { t: "Pending", tone: "harvest" }],
      ["E-0229", "08 Jul 2026", "Loading", "Loading crew — 28t maize", "GH₵ 1,120.00", { t: "Approved", tone: "leaf" }],
      ["E-0228", "07 Jul 2026", "Warehouse", "Fumigation — Main WH", "GH₵ 2,400.00", { t: "Approved", tone: "leaf" }],
      ["E-0227", "05 Jul 2026", "Other", "Airtime bundles — field agents", "GH₵ 300.00", { t: "Rejected", tone: "alert" }],
    ],
  },
  plots: {
    title: "Plots",
    sub: "Land inventory for sale",
    single: "Plot",
    add: "+ Add plot",
    search: "Search plot or location…",
    filters: ["Location", "Status"],
    newTag: { t: "Available", tone: "leaf" },
    headers: [
      { l: "Plot" },
      { l: "Location" },
      { l: "Size", wide: true },
      { l: "Price", align: "right", money: true },
      { l: "Buyer", wide: true },
      { l: "Status", tag: true },
    ],
    figs: [3],
    ledger: null,
    rows: [
      ["PL-014", "Kalpohin Estate", "100 × 80 ft", "GH₵ 85,000", "—", { t: "Available", tone: "leaf" }],
      ["PL-015", "Kalpohin Estate", "100 × 80 ft", "GH₵ 85,000", "Kwame Owusu", { t: "Reserved", tone: "harvest" }],
      ["PL-009", "Vittin", "70 × 100 ft", "GH₵ 64,000", "Alhaji Mahama", { t: "Sold", tone: "forest" }],
      ["PL-007", "Jisonayili", "100 × 100 ft", "GH₵ 58,000", "Mariama Seidu", { t: "Sold", tone: "forest" }],
      ["PL-002", "Jisonayili", "100 × 100 ft", "GH₵ 92,000", "—", { t: "Archived", tone: "slate" }],
    ],
  },
  "land-sales": {
    title: "Land Sales",
    sub: "Plot sales and instalment collections",
    single: "Land sale",
    add: "+ New land sale",
    search: "Search buyer or plot…",
    filters: ["Status"],
    newTag: { t: "Instalments", tone: "sky" },
    headers: [
      { l: "Ref" },
      { l: "Plot" },
      { l: "Buyer" },
      { l: "Agreed", align: "right", money: true },
      { l: "Paid", align: "right", money: true, wide: true },
      { l: "Balance", align: "right", money: true },
      { l: "Status", tag: true },
    ],
    figs: [3, 5],
    ledger: {
      title: "Instalments",
      rows: [
        { date: "02 Jul 2026", desc: "Instalment 2 — mobile money", amount: "+GH₵ 15,000.00", amtColor: "#2F5E3D", after: "GH₵ 55,000.00 due" },
        { date: "04 Jun 2026", desc: "Deposit — bank transfer", amount: "+GH₵ 15,000.00", amtColor: "#2F5E3D", after: "GH₵ 70,000.00 due" },
      ],
    },
    rows: [
      ["LS-032", "PL-015", "Kwame Owusu", "GH₵ 85,000", "GH₵ 30,000", { t: "GH₵ 55,000", c: "#B03A2E", w: 600 }, { t: "Instalments", tone: "sky" }],
      ["LS-031", "PL-009", "Alhaji Mahama", "GH₵ 64,000", "GH₵ 64,000", { t: "Paid in full", c: "#2F5E3D" }, { t: "Completed", tone: "leaf" }],
      ["LS-028", "PL-007", "Mariama Seidu", "GH₵ 58,000", "GH₵ 58,000", { t: "Paid in full", c: "#2F5E3D" }, { t: "Completed", tone: "leaf" }],
    ],
  },
  seasons: {
    title: "Seasons",
    sub: "Farming seasons and grant programmes",
    single: "Season",
    add: "+ New season",
    search: "Search season…",
    filters: ["Crop", "Status"],
    newTag: { t: "Active", tone: "leaf" },
    headers: [
      { l: "Season" },
      { l: "Crop" },
      { l: "Farmers", align: "right" },
      { l: "Granted", align: "right", money: true },
      { l: "Recovered", align: "right", money: true, wide: true },
      { l: "Status", tag: true },
    ],
    figs: [2, 3, 4],
    ledger: null,
    rows: [
      ["2026 Wet Season", "Maize", "142", "GH₵ 486,000", "GH₵ 121,500", { t: "Active", tone: "leaf" }],
      ["2025/26 Dry Season", "Rice", "38", "GH₵ 156,000", "GH₵ 148,200", { t: "Closing", tone: "harvest" }],
      ["2025 Wet Season", "Maize", "128", "GH₵ 402,000", "GH₵ 396,800", { t: "Closed", tone: "slate" }],
    ],
  },
  farmers: {
    avatar: true,
    title: "Farmers",
    sub: "Outgrower farmers in grant programmes",
    single: "Farmer",
    add: "+ Add farmer",
    search: "Search farmer or community…",
    filters: ["Community", "Season"],
    newTag: { t: "On track", tone: "leaf" },
    headers: [
      { l: "Farmer" },
      { l: "Community", wide: true },
      { l: "Season" },
      { l: "Granted", align: "right", money: true },
      { l: "Repaid", align: "right", money: true },
      { l: "Status", tag: true },
    ],
    figs: [3, 4],
    ledger: {
      title: "Repayments",
      rows: [
        { date: "08 Jul 2026", desc: "Produce — 500 kg maize at market rate", amount: "+GH₵ 850.00", amtColor: "#2F5E3D", after: "GH₵ 1,700.00 due" },
        { date: "28 Jun 2026", desc: "Mobile money", amount: "+GH₵ 850.00", amtColor: "#2F5E3D", after: "GH₵ 2,550.00 due" },
      ],
    },
    rows: [
      ["Abukari Yakubu", "Kumbungu", "2026 Wet", "GH₵ 3,400", "GH₵ 1,700", { t: "On track", tone: "leaf" }],
      ["Memunatu Iddrisu", "Tolon", "2026 Wet", "GH₵ 2,800", "GH₵ 400", { t: "Behind", tone: "harvest" }],
      ["Sulemana Baba", "Savelugu", "2026 Wet", "GH₵ 4,100", "GH₵ 0", { t: "Overdue", tone: "alert" }],
      ["Azara Fusheini", "Kumbungu", "2026 Wet", "GH₵ 2,200", "GH₵ 2,200", { t: "Settled", tone: "leaf" }],
    ],
  },
  grants: {
    title: "Grants",
    sub: "Input and cash grants to farmers",
    single: "Grant",
    add: "+ New grant",
    search: "Search farmer…",
    filters: ["Type", "Season"],
    newTag: { t: "Pending", tone: "harvest" },
    headers: [
      { l: "Ref" },
      { l: "Farmer" },
      { l: "Season", wide: true },
      { l: "Type" },
      { l: "Value", align: "right", money: true },
      { l: "Status", tag: true },
    ],
    figs: [4],
    ledger: null,
    rows: [
      ["G-0912", "Abukari Yakubu", "2026 Wet", "Inputs — seed + fertiliser", "GH₵ 1,900", { t: "Disbursed", tone: "leaf" }],
      ["G-0913", "Abukari Yakubu", "2026 Wet", "Cash", "GH₵ 1,500", { t: "Disbursed", tone: "leaf" }],
      ["G-0918", "Memunatu Iddrisu", "2026 Wet", "Cash", "GH₵ 2,800", { t: "Pending", tone: "harvest" }],
      ["G-0905", "Azara Fusheini", "2026 Wet", "Inputs — seed", "GH₵ 2,200", { t: "Repaid", tone: "leaf" }],
    ],
  },
  repayments: {
    title: "Repayments",
    sub: "Recoveries against farmer grants",
    single: "Repayment",
    add: "+ Record repayment",
    search: "Search farmer…",
    filters: ["Method", "Season"],
    newTag: { t: "Confirmed", tone: "leaf" },
    headers: [
      { l: "Ref" },
      { l: "Farmer" },
      { l: "Date" },
      { l: "Method", wide: true },
      { l: "Amount", align: "right", money: true },
      { l: "Status", tag: true },
    ],
    figs: [4],
    ledger: null,
    rows: [
      ["R-1204", "Azara Fusheini", "08 Jul 2026", "Produce — 500 kg maize", "GH₵ 2,200.00", { t: "Confirmed", tone: "leaf" }],
      ["R-1201", "Abukari Yakubu", "05 Jul 2026", "Mobile money", "GH₵ 850.00", { t: "Confirmed", tone: "leaf" }],
      ["R-1198", "Abukari Yakubu", "28 Jun 2026", "Produce — 200 kg maize", "GH₵ 850.00", { t: "Confirmed", tone: "leaf" }],
      ["R-1190", "Memunatu Iddrisu", "20 Jun 2026", "Cash at office", "GH₵ 400.00", { t: "Pending", tone: "harvest" }],
    ],
  },
  // `suppliers` and `buyers` retired from the stub registers: both are now
  // live, backend-driven modules (src/app/admin/{suppliers,buyers} +
  // components/admin/registry).
  // `users` retired from the stub registers: /admin/users is now a live,
  // backend-driven module (src/app/admin/users + components/admin/users).
  // `audit` retired from the stub registers: /admin/audit is now a live,
  // backend-driven module (src/app/admin/audit + components/admin/audit).
};

export function getRegister(
  slug: string,
): (RegisterConfig & { rows: RegisterRow[] }) | undefined {
  return Object.prototype.hasOwnProperty.call(REGISTERS, slug)
    ? REGISTERS[slug as RegisterSlug]
    : undefined;
}

/** Plain text of any cell shape (search, refs, detail values). */
export function cellText(cell: RegisterCell | undefined): string {
  if (cell == null) return "";
  return typeof cell === "object" ? cell.t : String(cell);
}

export function isTagCell(cell: RegisterCell): cell is RegisterTagCell {
  return typeof cell === "object" && cell !== null && "tone" in cell;
}

/** Find a row by its first-cell reference (the detail-route id). */
export function findRegisterRow(
  register: RegisterConfig & { rows: RegisterRow[] },
  ref: string,
): RegisterRow | undefined {
  return register.rows.find((row) => cellText(row[0]) === ref);
}

const AVATAR_PALETTE = [
  { bg: "#E7EEE9", fg: "#1E3D2B" },
  { bg: "#E8EFF4", fg: "#33587A" },
  { bg: "#F7EED8", fg: "#7A5407" },
  { bg: "#ECEFF3", fg: "#4c5765" },
  { bg: "#F0E9E0", fg: "#6B4A2C" },
];

/** Deterministic initials avatar (the design's `avatarOf`). */
export function avatarOf(name: string): { init: string; bg: string; fg: string } {
  const s = name || "?";
  let h = 0;
  for (let i = 0; i < s.length; i++) h += s.charCodeAt(i);
  const words = s.replace(/[^A-Za-z ]/g, "").trim().split(/\s+/);
  const init = ((words[0] || "?")[0] + ((words[1] || "")[0] || "")).toUpperCase();
  return { init, ...AVATAR_PALETTE[h % AVATAR_PALETTE.length] };
}
