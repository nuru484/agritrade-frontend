import type { Tone } from "@/components/admin/ui";
import { formatCedis } from "@/lib/format-money";

/**
 * Trading stub data (sales, shipments) straight from the DB Plus
 * Console design. `purchases` went live (components/admin/purchases) - its
 * rows below remain only because the sales/shipments stubs reference them.
 * Console design. Everything here is display-shaped: the backend will later
 * replace these with API payloads of the same shape.
 */

export interface MetaItem {
  k: string;
  v: string;
}

export interface TimelineItem {
  what: string;
  meta: string;
  /** Dot colour comes from the tone's dot in TONES. */
  tone: Tone;
}

export interface LedgerRow {
  date: string;
  desc: string;
  amount: string;
  /** credit = leaf, debit = red, pending = harvest amounts. */
  direction: "credit" | "debit" | "pending";
  /** Running figure ("Float after" / "Balance after"). */
  after: string;
  pending?: boolean;
}

/* ------------------------------- Purchases ------------------------------- */

export type PurchaseStatus = "Recorded" | "In transit" | "Received" | "Voided";

export interface PurchaseRow {
  ref: string;
  date: string;
  agent: string;
  supplier: string;
  commodity: string;
  weightKg: number;
  pricePerKg: number;
  status: PurchaseStatus;
  tone: Tone;
}

export const purchaseRows: PurchaseRow[] = [
  { ref: "P-0891", date: "10 Jul 2026", agent: "Ibrahim Fuseini", supplier: "Alhassan Grains, Savelugu", commodity: "Maize (white)", weightKg: 12400, pricePerKg: 4.2, status: "Received", tone: "leaf" },
  { ref: "P-0890", date: "10 Jul 2026", agent: "Salifu Issahaku", supplier: "Fati Alhassan, Walewale", commodity: "Soybeans", weightKg: 3150, pricePerKg: 6.8, status: "In transit", tone: "sky" },
  { ref: "P-0889", date: "09 Jul 2026", agent: "Yakubu Mohammed", supplier: "Kukuo Women’s Co-op", commodity: "Shea nuts", weightKg: 1860, pricePerKg: 5.1, status: "Recorded", tone: "sky" },
  { ref: "P-0888", date: "09 Jul 2026", agent: "Amina Abdulai", supplier: "Tia Farms, Kumbungu", commodity: "Maize (white)", weightKg: 8000, pricePerKg: 4.15, status: "Received", tone: "leaf" },
  { ref: "P-0887", date: "08 Jul 2026", agent: "Ibrahim Fuseini", supplier: "Wumpini Agro, Tolon", commodity: "Groundnuts", weightKg: 2240, pricePerKg: 7.5, status: "Received", tone: "leaf" },
  { ref: "P-0886", date: "08 Jul 2026", agent: "Salifu Issahaku", supplier: "Alhassan Grains, Savelugu", commodity: "Maize (white)", weightKg: 5600, pricePerKg: 4.25, status: "Voided", tone: "slate" },
  { ref: "P-0885", date: "07 Jul 2026", agent: "Yakubu Mohammed", supplier: "Nyohini Traders", commodity: "Soybeans", weightKg: 4780, pricePerKg: 6.75, status: "In transit", tone: "sky" },
  { ref: "P-0884", date: "07 Jul 2026", agent: "Ibrahim Fuseini", supplier: "Kukuo Women’s Co-op", commodity: "Shea nuts", weightKg: 2300, pricePerKg: 5.05, status: "Received", tone: "leaf" },
  { ref: "P-0883", date: "06 Jul 2026", agent: "Amina Abdulai", supplier: "Tia Farms, Kumbungu", commodity: "Rice paddy", weightKg: 6900, pricePerKg: 3.9, status: "Received", tone: "leaf" },
  { ref: "P-0882", date: "06 Jul 2026", agent: "Salifu Issahaku", supplier: "Fati Alhassan, Walewale", commodity: "Maize (white)", weightKg: 10150, pricePerKg: 4.1, status: "Received", tone: "leaf" },
];

export const purchaseAgents = ["Ibrahim Fuseini", "Salifu Issahaku", "Yakubu Mohammed", "Amina Abdulai"];
export const purchaseWarehouses = ["Main Warehouse, Tamale", "Savelugu Depot", "Walewale Store"];
export const purchaseCommodities = ["Maize (white)", "Soybeans", "Shea nuts", "Groundnuts", "Rice paddy"];

export const purchaseTotal = (row: PurchaseRow): number => row.weightKg * row.pricePerKg;

export interface PurchaseDetail {
  row: PurchaseRow;
  totalCedis: number;
  ledger: LedgerRow[];
  notes: string;
  meta: MetaItem[];
  timeline: TimelineItem[];
}

export function getPurchaseDetail(ref: string): PurchaseDetail | undefined {
  const row = purchaseRows.find((r) => r.ref === ref);
  if (!row) return undefined;
  const total = purchaseTotal(row);
  const voided = row.status === "Voided";
  const received = row.status === "Received";
  const timeline: TimelineItem[] = voided
    ? [
        { what: "Voided — duplicate entry", meta: "Abdul · 08 Jul, 18:03", tone: "alert" },
        { what: "Recorded in the field", meta: `${row.agent} · ${row.date}`, tone: "slate" },
      ]
    : [
        {
          what: received ? "Received at Main Warehouse" : "Awaiting arrival at warehouse",
          meta: received ? `Amina · ${row.date}, 16:40` : "In progress",
          tone: received ? "leaf" : "harvest",
        },
        { what: `Deducted from ${row.agent.split(" ")[0]}’s float`, meta: `System · ${row.date}`, tone: "sky" },
        { what: "Recorded in the field", meta: `${row.agent} · ${row.date}`, tone: "slate" },
      ];
  return {
    row,
    totalCedis: total,
    ledger: [
      {
        date: row.date,
        desc: `Purchase ${row.ref} — ${row.commodity}, ${row.supplier}`,
        amount: `−${formatCedis(total)}`,
        direction: "debit",
        after: "GH₵ 1,240.00",
      },
      {
        date: "05 Jul 2026",
        desc: "Float top-up — bank transfer",
        amount: "+GH₵ 30,000.00",
        direction: "credit",
        after: formatCedis(1240 + total),
      },
    ],
    notes: "Moisture 13.2% · 124 bags of 100 kg · weighed at Savelugu weighbridge.",
    meta: [
      { k: "Recorded by", v: row.agent },
      { k: "Warehouse", v: "Main Warehouse, Tamale" },
      { k: "Lot", v: `LOT-${row.ref.slice(2)}` },
      { k: "Supplier", v: row.supplier },
      { k: "Reference", v: row.ref },
    ],
    timeline,
  };
}

/* --------------------------------- Sales --------------------------------- */

export type SaleStatus = "Draft" | "Confirmed" | "Fulfilled" | "Completed";

export interface SaleRow {
  ref: string;
  buyer: string;
  goods: string;
  agreedCedis: number;
  paidCedis: number;
  status: SaleStatus;
  tone: Tone;
}

export const saleRows: SaleRow[] = [
  { ref: "S-0344", buyer: "Ghana Nuts Co.", goods: "12,000 kg shea nuts", agreedCedis: 61200, paidCedis: 61200, status: "Completed", tone: "leaf" },
  { ref: "S-0343", buyer: "Avnash Industries", goods: "18,500 kg soybeans", agreedCedis: 125800, paidCedis: 62900, status: "Fulfilled", tone: "sky" },
  { ref: "S-0341", buyer: "Premium Foods Ltd", goods: "28,000 kg maize (white)", agreedCedis: 120000, paidCedis: 40000, status: "Confirmed", tone: "forest" },
  { ref: "S-0339", buyer: "Wilmar Ghana", goods: "9,400 kg groundnuts", agreedCedis: 79900, paidCedis: 0, status: "Draft", tone: "slate" },
  { ref: "S-0336", buyer: "Yedent Agro", goods: "15,000 kg maize (white)", agreedCedis: 63000, paidCedis: 63000, status: "Completed", tone: "leaf" },
];

export interface SaleMilestone {
  /** Percentage of the agreed amount (also the bar position). */
  pct: number;
  label: string;
  amountCedis: number;
}

export interface SaleShipmentLink {
  ref: string;
  desc: string;
  status: string;
  tone: Tone;
}

export interface SaleDetail {
  row: SaleRow;
  subline: string;
  fulfilledKg: number;
  totalKg: number;
  /** Milestone (as % of agreed) required before dispatch. */
  dispatchPct: number;
  milestones: SaleMilestone[];
  payments: LedgerRow[];
  shipments: SaleShipmentLink[];
  meta: MetaItem[];
  timeline: TimelineItem[];
}

const saleMilestones = (agreed: number): SaleMilestone[] => [
  { pct: 30, label: "30% Confirm", amountCedis: agreed * 0.3 },
  { pct: 80, label: "80% Dispatch", amountCedis: agreed * 0.8 },
  { pct: 100, label: "100% Close", amountCedis: agreed },
];

/** Curated detail for the design's hero sale; a derived stub for the rest. */
export function getSaleDetail(ref: string): SaleDetail | undefined {
  const row = saleRows.find((r) => r.ref === ref);
  if (!row) return undefined;
  const totalKg = parseInt(row.goods.replace(/,/g, ""), 10) || 0;

  if (row.ref === "S-0341") {
    return {
      row,
      subline: "28,000 kg maize (white) · agreed 08 Jun 2026 · Accra-Tema route",
      fulfilledKg: 0,
      totalKg,
      dispatchPct: 80,
      milestones: saleMilestones(row.agreedCedis),
      payments: [
        { date: "12 Jun 2026", desc: "Deposit — bank transfer, GCB", amount: "+GH₵ 25,000.00", direction: "credit", after: "GH₵ 25,000.00" },
        { date: "28 Jun 2026", desc: "Hubtel payment link", amount: "+GH₵ 15,000.00", direction: "credit", after: "GH₵ 40,000.00" },
        { date: "09 Jul 2026", desc: "Hubtel link — expires 11 Jul, 18:00", amount: "GH₵ 56,000.00", direction: "pending", after: "—", pending: true },
      ],
      shipments: [{ ref: "SH-0119", desc: "Tamale → Tema · 28,000 kg", status: "Loading", tone: "harvest" }],
      meta: [
        { k: "Created by", v: "Amina Abdulai" },
        { k: "Created", v: "08 Jun 2026, 10:14" },
        { k: "Warehouse", v: "Main Warehouse, Tamale" },
        { k: "Payment policy", v: "30 / 80 / 100" },
        { k: "Buyer contact", v: "+233 24 887 1102" },
      ],
      timeline: [
        { what: "Payment link sent to buyer", meta: "Amina · 09 Jul, 09:12", tone: "harvest" },
        { what: "Loading started on SH-0119", meta: "Warehouse · 08 Jul, 07:30", tone: "sky" },
        { what: "Payment received — GH₵ 15,000.00", meta: "Hubtel · 28 Jun, 16:44", tone: "leaf" },
        { what: "Payment received — GH₵ 25,000.00", meta: "GCB transfer · 12 Jun, 11:02", tone: "leaf" },
        { what: "Sale confirmed at 30% milestone", meta: "System · 12 Jun, 11:02", tone: "forest" },
        { what: "Sale created", meta: "Amina · 08 Jun, 10:14", tone: "slate" },
      ],
    };
  }

  const fulfilled = row.status === "Fulfilled" || row.status === "Completed";
  const payments: LedgerRow[] =
    row.paidCedis > 0
      ? [
          {
            date: "05 Jun 2026",
            desc: row.paidCedis === row.agreedCedis ? "Paid in full — bank transfer" : "Deposit — bank transfer",
            amount: `+${formatCedis(row.paidCedis)}`,
            direction: "credit",
            after: formatCedis(row.paidCedis),
          },
        ]
      : [];
  const timeline: TimelineItem[] = [
    ...(row.status === "Completed" ? [{ what: "Sale completed and closed", meta: "System · 30 Jun, 12:00", tone: "leaf" as Tone }] : []),
    ...(row.paidCedis > 0
      ? [
          { what: `Payment received — ${formatCedis(row.paidCedis)}`, meta: "Bank transfer · 05 Jun, 11:02", tone: "leaf" as Tone },
          { what: "Sale confirmed at 30% milestone", meta: "System · 05 Jun, 11:02", tone: "forest" as Tone },
        ]
      : []),
    { what: "Sale created", meta: "Amina · 01 Jun 2026, 10:14", tone: "slate" },
  ];
  return {
    row,
    subline: `${row.goods} · agreed 01 Jun 2026`,
    fulfilledKg: fulfilled ? totalKg : 0,
    totalKg,
    dispatchPct: 80,
    milestones: saleMilestones(row.agreedCedis),
    payments,
    shipments: row.ref === "S-0344" ? [{ ref: "SH-0117", desc: "Tamale → Techiman · 12,000 kg", status: "Arrived", tone: "leaf" }] : [],
    meta: [
      { k: "Created by", v: "Amina Abdulai" },
      { k: "Created", v: "01 Jun 2026, 10:14" },
      { k: "Warehouse", v: "Main Warehouse, Tamale" },
      { k: "Payment policy", v: "30 / 80 / 100" },
    ],
    timeline,
  };
}

/* ------------------------------- Shipments ------------------------------- */

export type ShipmentStatus = "Planned" | "Loading" | "Dispatched" | "Arrived" | "Closed";

export interface ShipmentRow {
  ref: string;
  status: ShipmentStatus;
  tone: Tone;
  route: string;
  cargo: string;
  meta: string;
}

export const shipmentRows: ShipmentRow[] = [
  { ref: "SH-0121", status: "Dispatched", tone: "sky", route: "Savelugu → Tamale", cargo: "9,600 kg soybeans · internal transfer", meta: "Truck GN 3311-24 · departed 10 Jul, 15:10" },
  { ref: "SH-0119", status: "Loading", tone: "harvest", route: "Tamale → Tema", cargo: "28,000 kg maize · Premium Foods Ltd", meta: "Truck GT 5482-22 · Sale S-0341" },
  { ref: "SH-0117", status: "Arrived", tone: "leaf", route: "Tamale → Techiman", cargo: "12,000 kg shea nuts · Ghana Nuts Co.", meta: "Arrived 09 Jul, 11:40 · awaiting close" },
  { ref: "SH-0114", status: "Closed", tone: "slate", route: "Walewale → Tamale", cargo: "10,150 kg maize · internal transfer", meta: "Closed 06 Jul" },
];

export const SHIPMENT_STEPS: ShipmentStatus[] = ["Planned", "Loading", "Dispatched", "Arrived", "Closed"];

export interface ShipmentLot {
  ref: string;
  origin: string;
  loaded: string;
  cost: string;
  estimated: boolean;
}

export interface ShipmentDetail {
  row: ShipmentRow;
  saleRef?: string;
  buyer?: string;
  truck: string;
  driver: string;
  /** Index into SHIPMENT_STEPS. */
  currentStep: number;
  /** Lot ref whose cost basis is estimated (drives the warn banner). */
  estimatedLotRef?: string;
  lots: ShipmentLot[];
  totalLoadedKg: number;
  totalLoadedCost: string;
  photoSlots: string[];
  meta: MetaItem[];
  timeline: TimelineItem[];
  /** Present when dispatch is gated on a sale payment milestone. */
  dispatchGate?: { saleRef: string; requiredPct: number; paidCedis: number; requiredCedis: number };
}

const shipmentDetails: Record<string, Omit<ShipmentDetail, "row">> = {
  "SH-0119": {
    saleRef: "S-0341",
    buyer: "Premium Foods Ltd",
    truck: "GT 5482-22",
    driver: "Musah Iddrisu",
    currentStep: 1,
    estimatedLotRef: "LOT-0431",
    lots: [
      { ref: "LOT-0455", origin: "P-0891", loaded: "12,400 kg", cost: "GH₵ 52,080.00", estimated: false },
      { ref: "LOT-0442", origin: "P-0888", loaded: "8,000 kg", cost: "GH₵ 33,200.00", estimated: false },
      { ref: "LOT-0431", origin: "—", loaded: "7,600 kg", cost: "~GH₵ 31,160.00", estimated: true },
    ],
    totalLoadedKg: 28000,
    totalLoadedCost: "~GH₵ 116,440.00",
    photoSlots: ["Loading bay", "Weighbridge ticket", "Sealed truck before departure"],
    meta: [
      { k: "Sale", v: "S-0341 · Premium Foods" },
      { k: "Truck", v: "GT 5482-22" },
      { k: "Driver", v: "Musah Iddrisu · +233 20 552 8841" },
      { k: "Origin", v: "Main Warehouse, Tamale" },
      { k: "Destination", v: "Tema Port Depot" },
      { k: "Planned by", v: "Amina · 07 Jul" },
    ],
    timeline: [
      { what: "Lot LOT-0442 loaded — 8,000 kg", meta: "Warehouse · 10 Jul, 16:20", tone: "sky" },
      { what: "Lot LOT-0455 loaded — 12,400 kg", meta: "Warehouse · 10 Jul, 14:05", tone: "sky" },
      { what: "Loading started", meta: "Ibrahim · 08 Jul, 07:30", tone: "harvest" },
      { what: "Shipment planned", meta: "Amina · 07 Jul, 15:48", tone: "slate" },
    ],
    dispatchGate: { saleRef: "S-0341", requiredPct: 80, paidCedis: 40000, requiredCedis: 96000 },
  },
  "SH-0121": {
    truck: "GN 3311-24",
    driver: "Abdul Karim",
    currentStep: 2,
    lots: [
      { ref: "LOT-0449", origin: "P-0885", loaded: "4,780 kg", cost: "GH₵ 32,265.00", estimated: false },
      { ref: "LOT-0437", origin: "P-0872", loaded: "4,820 kg", cost: "GH₵ 31,812.00", estimated: false },
    ],
    totalLoadedKg: 9600,
    totalLoadedCost: "GH₵ 64,077.00",
    photoSlots: ["Loading bay", "Sealed truck before departure"],
    meta: [
      { k: "Type", v: "Internal transfer" },
      { k: "Truck", v: "GN 3311-24" },
      { k: "Driver", v: "Abdul Karim · +233 24 118 6650" },
      { k: "Origin", v: "Savelugu Depot" },
      { k: "Destination", v: "Main Warehouse, Tamale" },
      { k: "Planned by", v: "Salifu · 09 Jul" },
    ],
    timeline: [
      { what: "Truck departed Savelugu", meta: "Salifu · 10 Jul, 15:10", tone: "sky" },
      { what: "Loading completed — 9,600 kg", meta: "Warehouse · 10 Jul, 13:45", tone: "sky" },
      { what: "Shipment planned", meta: "Salifu · 09 Jul, 08:20", tone: "slate" },
    ],
  },
  "SH-0117": {
    saleRef: "S-0344",
    buyer: "Ghana Nuts Co.",
    truck: "GT 7710-21",
    driver: "Fuseini Alhassan",
    currentStep: 3,
    lots: [
      { ref: "LOT-0428", origin: "P-0884", loaded: "2,300 kg", cost: "GH₵ 11,615.00", estimated: false },
      { ref: "LOT-0421", origin: "P-0870", loaded: "9,700 kg", cost: "GH₵ 48,985.00", estimated: false },
    ],
    totalLoadedKg: 12000,
    totalLoadedCost: "GH₵ 60,600.00",
    photoSlots: ["Loading bay", "Weighbridge ticket"],
    meta: [
      { k: "Sale", v: "S-0344 · Ghana Nuts Co." },
      { k: "Truck", v: "GT 7710-21" },
      { k: "Driver", v: "Fuseini Alhassan · +233 26 774 0912" },
      { k: "Origin", v: "Main Warehouse, Tamale" },
      { k: "Destination", v: "Techiman Depot" },
      { k: "Planned by", v: "Amina · 06 Jul" },
    ],
    timeline: [
      { what: "Arrived at Techiman Depot", meta: "Driver · 09 Jul, 11:40", tone: "leaf" },
      { what: "Truck dispatched", meta: "Warehouse · 08 Jul, 06:15", tone: "sky" },
      { what: "Shipment planned", meta: "Amina · 06 Jul, 14:02", tone: "slate" },
    ],
  },
  "SH-0114": {
    truck: "GN 8834-20",
    driver: "Yussif Mohammed",
    currentStep: 4,
    lots: [{ ref: "LOT-0410", origin: "P-0882", loaded: "10,150 kg", cost: "GH₵ 41,615.00", estimated: false }],
    totalLoadedKg: 10150,
    totalLoadedCost: "GH₵ 41,615.00",
    photoSlots: ["Loading bay"],
    meta: [
      { k: "Type", v: "Internal transfer" },
      { k: "Truck", v: "GN 8834-20" },
      { k: "Driver", v: "Yussif Mohammed · +233 20 331 5527" },
      { k: "Origin", v: "Walewale Store" },
      { k: "Destination", v: "Main Warehouse, Tamale" },
      { k: "Planned by", v: "Salifu · 05 Jul" },
    ],
    timeline: [
      { what: "Shipment closed", meta: "Amina · 06 Jul, 17:20", tone: "slate" },
      { what: "Arrived at Main Warehouse", meta: "Driver · 06 Jul, 12:05", tone: "leaf" },
      { what: "Truck dispatched", meta: "Warehouse · 06 Jul, 07:40", tone: "sky" },
      { what: "Shipment planned", meta: "Salifu · 05 Jul, 16:11", tone: "slate" },
    ],
  },
};

export function getShipmentDetail(ref: string): ShipmentDetail | undefined {
  const row = shipmentRows.find((r) => r.ref === ref);
  const detail = shipmentDetails[ref];
  if (!row || !detail) return undefined;
  return { row, ...detail };
}

/** "GH₵ 40,000" — whole-cedi figure used in milestone copy and warn dialogs. */
export function formatCedisWhole(major: number): string {
  return `GH₵ ${major.toLocaleString("en-GH", { maximumFractionDigits: 0 })}`;
}
