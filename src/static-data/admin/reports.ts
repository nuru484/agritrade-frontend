/**
 * Reports stub data (values verbatim from the Nasara Console design):
 * Jun 2026 P&L vs May, six-month revenue/profit trend, commodity margins
 * and agent performance. Money stays as the design's display strings.
 */

export interface ReportFilter {
  k: string;
  v: string;
}

export const REPORT_FILTERS: ReportFilter[] = [
  { k: "Period", v: "Jun 2026" },
  { k: "Compare", v: "May 2026" },
  { k: "Commodity", v: "All" },
  { k: "Warehouse", v: "All" },
  { k: "Agent", v: "All" },
];

export const REPORT_PERIOD_CHIP = "Jun 2026 vs May 2026";

export interface ReportKpi {
  label: string;
  value: string;
  delta: string;
  /** Delta renders green when true (else muted slate). */
  deltaUp?: boolean;
  /** Value renders profit-green when true (Net profit). */
  profit?: boolean;
}

export const REPORT_KPIS: ReportKpi[] = [
  { label: "Revenue", value: "GH₵ 262,400", delta: "+15.1% vs May", deltaUp: true },
  { label: "Cost of goods", value: "~GH₵ 198,600", delta: "+13.8% vs May" },
  { label: "Gross profit", value: "GH₵ 63,800", delta: "24.3% margin" },
  { label: "Expenses", value: "GH₵ 28,900", delta: "+4.2% vs May" },
  { label: "Net profit", value: "GH₵ 34,900", delta: "+24.2% vs May", deltaUp: true, profit: true },
  { label: "Net margin", value: "13.3%", delta: "May: 12.3%" },
];

/** Six-month trend (GH₵ thousands) — both series share the revenue scale. */
export const PROFIT_TREND = {
  revenue: [182, 214, 168, 246, 228, 262],
  netProfit: [21.4, 26.8, 14.2, 32.6, 28.1, 34.9],
  xLabels: ["Feb", "Mar", "Apr", "May", "Jun", "Jul"],
} as const;

export interface CommodityProfitBar {
  name: string;
  value: string;
  /** Bar width as a percentage of the widest bar. */
  pct: number;
  color: string;
}

export const COMMODITY_PROFIT_BARS: CommodityProfitBar[] = [
  { name: "Maize (white)", value: "GH₵ 37,000", pct: 100, color: "#1E3D2B" },
  { name: "Soybeans", value: "GH₵ 17,200", pct: 46, color: "#3E6B8C" },
  { name: "Shea nuts", value: "GH₵ 6,400", pct: 17, color: "#B8860B" },
  { name: "Groundnuts", value: "GH₵ 3,200", pct: 9, color: "#7A7568" },
];

export const ESTIMATE_NOTICE_AMOUNT = "~GH₵ 31,160";

export interface PlRow {
  label: string;
  amount: string;
  /** Indented sub-line under a section heading. */
  indent?: boolean;
  /** Row treatment: plain section line, tinted subtotal, or the net row. */
  emphasis?: "subtotal" | "net";
  /** "Est." pill — cost of goods carries estimated lot costs. */
  est?: boolean;
  /** Amount renders in alert red (cost of goods sold). */
  negative?: boolean;
}

export const PL_ROWS: PlRow[] = [
  { label: "Revenue", amount: "GH₵ 262,400.00" },
  { label: "Grain sales", amount: "244,900.00", indent: true },
  { label: "Land sales", amount: "17,500.00", indent: true },
  { label: "Cost of goods sold", amount: "−198,600.00", est: true, negative: true },
  { label: "Gross profit", amount: "GH₵ 63,800.00", emphasis: "subtotal" },
  { label: "Transport & loading", amount: "−12,400.00", indent: true },
  { label: "Agent commissions", amount: "−6,800.00", indent: true },
  { label: "Warehouse & security", amount: "−4,200.00", indent: true },
  { label: "Other expenses", amount: "−5,500.00", indent: true },
  { label: "Net profit", amount: "GH₵ 34,900.00", emphasis: "net" },
];

export interface AgentPerformanceRow {
  name: string;
  buys: string;
  kg: string;
  avg: string;
  spent: string;
}

export const AGENT_PERFORMANCE: AgentPerformanceRow[] = [
  { name: "Ibrahim Fuseini", buys: "18", kg: "38,400 kg", avg: "4.18", spent: "GH₵ 160,500" },
  { name: "Salifu Issahaku", buys: "14", kg: "29,150 kg", avg: "4.42", spent: "GH₵ 128,800" },
  { name: "Amina Abdulai", buys: "11", kg: "26,900 kg", avg: "4.05", spent: "GH₵ 109,000" },
  { name: "Yakubu Mohammed", buys: "9", kg: "13,940 kg", avg: "5.61", spent: "GH₵ 78,200" },
];
