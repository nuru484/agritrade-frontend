import type { Tone } from "@/components/admin/ui";
import { ADMIN_HOME } from "@/static-data/admin/nav";

/**
 * Dashboard stub data (values verbatim from the Nasara Console design).
 * Display strings stay pre-formatted exactly as the design renders them;
 * chart series stay raw numbers so the SVG scaling math matches the design.
 */

export interface DashboardKpi {
  label: string;
  value: string;
  sub: string;
  href: string;
  /** Raw sparkline series — scaled into the card's 120×26 viewBox. */
  series: number[];
  /** Balances due renders in console red with a matching tinted spark. */
  alert?: boolean;
}

export const DASHBOARD_KPIS: DashboardKpi[] = [
  {
    label: "Stock on hand",
    value: "128,450 kg",
    sub: "Maize · Soybeans · Shea",
    href: `${ADMIN_HOME}/stock`,
    series: [96, 102, 99, 110, 118, 114, 121, 128],
  },
  {
    label: "Paid goods incoming",
    value: "GH₵ 128,400",
    sub: "2 trucks in transit",
    href: `${ADMIN_HOME}/shipments`,
    series: [40, 66, 52, 88, 74, 110, 96, 128],
  },
  {
    label: "Cash with agents",
    value: "GH₵ 46,120",
    sub: "4 active agents",
    href: `${ADMIN_HOME}/agents`,
    series: [52, 44, 60, 49, 55, 41, 50, 46],
  },
  {
    label: "Sales in progress",
    value: "7",
    sub: "GH₵ 312,600 agreed",
    href: `${ADMIN_HOME}/sales`,
    series: [3, 4, 4, 6, 5, 7, 6, 7],
  },
  {
    label: "Balances due",
    value: "GH₵ 63,780",
    sub: "3 buyers overdue",
    href: `${ADMIN_HOME}/sales`,
    series: [22, 30, 41, 38, 52, 47, 58, 64],
    alert: true,
  },
];

/** Cash flow — last 30 days (weekly-ish samples, GH₵ thousands). */
export const CASH_FLOW = {
  salesIn: [6.2, 9.8, 4.5, 12.4, 8.1, 14.2, 10.6, 9.0, 15.4, 11.2, 13.8, 16.4],
  purchasesOut: [8.4, 7.2, 10.1, 9.6, 12.8, 8.9, 11.4, 13.2, 9.8, 12.1, 10.4, 11.9],
  xLabels: ["12 Jun", "19 Jun", "26 Jun", "03 Jul", "10 Jul"],
} as const;

/** Weekly volume bought, in tonnes per commodity. */
export interface VolumeWeek {
  label: string;
  maize: number;
  soybeans: number;
  shea: number;
}

export const WEEKLY_VOLUME: VolumeWeek[] = [
  { label: "18/5", maize: 14.2, soybeans: 5.1, shea: 2.0 },
  { label: "25/5", maize: 11.8, soybeans: 6.4, shea: 1.4 },
  { label: "1/6", maize: 16.5, soybeans: 4.2, shea: 2.8 },
  { label: "8/6", maize: 13.1, soybeans: 7.8, shea: 1.9 },
  { label: "15/6", maize: 18.4, soybeans: 5.5, shea: 3.2 },
  { label: "22/6", maize: 15.2, soybeans: 8.1, shea: 2.4 },
  { label: "29/6", maize: 20.6, soybeans: 6.9, shea: 4.1 },
  { label: "6/7", maize: 22.4, soybeans: 7.9, shea: 4.2 },
];

/** Stock mix donut — shares must sum to 1. */
export interface StockSlice {
  name: string;
  color: string;
  share: number;
  pct: string;
}

export const STOCK_MIX: { center: string; centerLabel: string; slices: StockSlice[] } = {
  center: "128.5t",
  centerLabel: "ON HAND",
  slices: [
    { name: "Maize (white)", color: "#1E3D2B", share: 0.655, pct: "65.5%" },
    { name: "Soybeans", color: "#3E6B8C", share: 0.245, pct: "24.5%" },
    { name: "Shea nuts", color: "#B8860B", share: 0.1, pct: "10.0%" },
  ],
};

/** First four pending approvals, previewed on the dashboard. */
export interface ApprovalPreview {
  kind: string;
  tone: Tone;
  amount: string;
  summary: string;
  who: string;
}

export const APPROVALS_PREVIEW: ApprovalPreview[] = [
  {
    kind: "Void purchase",
    tone: "alert",
    amount: "GH₵ 23,800.00",
    summary: "Void purchase P-0886 — duplicate entry",
    who: "Yakubu Mohammed",
  },
  {
    kind: "Dispatch below milestone",
    tone: "harvest",
    amount: "GH₵ 96,000.00",
    summary: "Dispatch shipment for Sale S-0341 — Premium Foods Ltd",
    who: "Amina Abdulai",
  },
  {
    kind: "Float top-up",
    tone: "sky",
    amount: "GH₵ 20,000.00",
    summary: "Top up float for Savelugu market week",
    who: "Ibrahim Fuseini",
  },
  {
    kind: "Expense",
    tone: "sky",
    amount: "GH₵ 850.00",
    summary: "Truck repair — brake pads, GT 5482-22",
    who: "Salifu Issahaku",
  },
];

export interface TruckOnRoad {
  ref: string;
  status: string;
  tone: Tone;
  route: string;
  cargo: string;
  buyer: string;
}

export const TRUCKS_ON_ROAD: TruckOnRoad[] = [
  {
    ref: "SH-0119",
    status: "Loading",
    tone: "harvest",
    route: "Tamale → Tema",
    cargo: "28,000 kg maize",
    buyer: "Premium Foods Ltd",
  },
  {
    ref: "SH-0121",
    status: "Dispatched",
    tone: "sky",
    route: "Savelugu → Tamale",
    cargo: "9,600 kg soybeans",
    buyer: "Internal transfer",
  },
  {
    ref: "SH-0117",
    status: "Arrived",
    tone: "leaf",
    route: "Tamale → Techiman",
    cargo: "12,000 kg shea nuts",
    buyer: "Ghana Nuts Co.",
  },
];

export const STOCK_BY_COMMODITY: { name: string; kg: string }[] = [
  { name: "Maize (white)", kg: "84,200 kg" },
  { name: "Soybeans", kg: "31,450 kg" },
  { name: "Shea nuts", kg: "12,800 kg" },
];

export interface AgentFloat {
  name: string;
  amount: string;
  /** Amount colour from the design: gold when low, red when fronted. */
  amountColor: string;
  fronted: boolean;
}

export const AGENT_FLOATS: AgentFloat[] = [
  { name: "Ibrahim Fuseini", amount: "GH₵ 1,240.00", amountColor: "#7A5407", fronted: false },
  { name: "Salifu Issahaku", amount: "−GH₵ 480.00", amountColor: "#B03A2E", fronted: true },
  { name: "Yakubu Mohammed", amount: "GH₵ 2,905.00", amountColor: "#161c24", fronted: false },
  { name: "Fuseina Alhassan", amount: "GH₵ 12,455.00", amountColor: "#161c24", fronted: false },
];

export interface ActivityItem {
  what: string;
  meta: string;
  tone: Tone;
}

export const RECENT_ACTIVITY: ActivityItem[] = [
  {
    what: "Purchase P-0891 received at Main Warehouse",
    meta: "Amina · 10 Jul, 16:40",
    tone: "leaf",
  },
  {
    what: "Payment link sent on Sale S-0341",
    meta: "Amina · 09 Jul, 09:12",
    tone: "harvest",
  },
  {
    what: "SH-0117 arrived at Techiman",
    meta: "Driver check-in · 09 Jul, 11:40",
    tone: "leaf",
  },
  {
    what: "Purchase P-0886 voided — duplicate",
    meta: "Abdul · 08 Jul, 18:03",
    tone: "alert",
  },
  {
    what: "Float top-up GH₵ 15,000 to Fuseina",
    meta: "Abdul · 08 Jul, 08:15",
    tone: "sky",
  },
];
