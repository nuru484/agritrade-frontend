import type { Tone } from "@/components/admin/ui";

/**
 * Inbox stubs (from the DB Plus Console design script): the approval queue,
 * the notification feed and the profile's active sessions. All placeholder
 * data until the backend hookup.
 */

export type ApprovalStatus = "approved" | "pending" | "rejected";

export interface ApprovalRequest {
  id: number;
  kind: string;
  /** Chip tone: alert = voids, harvest = overrides/milestones, sky = money movements. */
  tone: Tone;
  who: string;
  when: string;
  summary: string;
  context: string;
  amount: string;
  status: ApprovalStatus;
  /** Reason captured when the request is rejected. */
  note?: string;
}

export const approvalRequests: ApprovalRequest[] = [
  {
    id: 1,
    kind: "Void purchase",
    tone: "alert",
    who: "Yakubu Mohammed",
    when: "Today, 06:55",
    summary: "Void purchase P-0886 — duplicate entry",
    context: "Reverses GH₵ 23,800.00 back to stock and Salifu’s float",
    amount: "GH₵ 23,800.00",
    status: "pending",
  },
  {
    id: 2,
    kind: "Dispatch below milestone",
    tone: "harvest",
    who: "Amina Abdulai",
    when: "Today, 07:10",
    summary: "Dispatch shipment for Sale S-0341 — Premium Foods Ltd",
    context: "Paid GH₵ 40,000 of required GH₵ 96,000 (80% milestone)",
    amount: "GH₵ 96,000.00",
    status: "pending",
  },
  {
    id: 3,
    kind: "Float top-up",
    tone: "sky",
    who: "Ibrahim Fuseini",
    when: "Yesterday, 17:42",
    summary: "Top up float for Savelugu market week",
    context: "Current float GH₵ 1,240.00 · last top-up 28 Jun",
    amount: "GH₵ 20,000.00",
    status: "pending",
  },
  {
    id: 4,
    kind: "Expense",
    tone: "sky",
    who: "Salifu Issahaku",
    when: "Yesterday, 15:03",
    summary: "Truck repair — brake pads, GT 5482-22",
    context: "Charged against Shipment SH-0119",
    amount: "GH₵ 850.00",
    status: "pending",
  },
  {
    id: 5,
    kind: "Price override",
    tone: "harvest",
    who: "Amina Abdulai",
    when: "Yesterday, 11:20",
    summary: "Buy maize above ceiling — GH₵ 4.85/kg at Kumbungu",
    context: "Ceiling is GH₵ 4.40/kg · supplier: Tia Farms",
    amount: "GH₵ 4.85 /kg",
    status: "pending",
  },
];

export interface ConsoleNotification {
  id: number;
  title: string;
  meta: string;
  unread: boolean;
}

export const consoleNotifications: ConsoleNotification[] = [
  {
    id: 1,
    title: "Dispatch below milestone needs your approval — SH-0119",
    meta: "Approvals · 07:10",
    unread: true,
  },
  {
    id: 2,
    title: "Salifu’s float went negative (−GH₵ 480.00)",
    meta: "Agents · Yesterday, 16:20",
    unread: true,
  },
  {
    id: 3,
    title: "Payment link on S-0341 expires in 48h",
    meta: "Sales · Yesterday, 09:12",
    unread: true,
  },
  {
    id: 4,
    title: "SH-0117 arrived at Techiman",
    meta: "Shipments · 09 Jul, 11:40",
    unread: false,
  },
  {
    id: 5,
    title: "Purchase P-0886 voided by Abdul",
    meta: "Purchases · 08 Jul, 18:03",
    unread: false,
  },
  {
    id: 6,
    title: "Grant G-0918 pending disbursement",
    meta: "Farm · 08 Jul, 10:30",
    unread: false,
  },
];

export interface ProfileSession {
  device: string;
  meta: string;
  current: boolean;
}

export const profileSessions: ProfileSession[] = [
  { device: "Chrome on Windows — office desktop", meta: "Tamale · active now", current: true },
  { device: "Safari on iPhone 13", meta: "Tamale · 2 hours ago", current: false },
  { device: "Chrome on Android — Infinix", meta: "Savelugu · yesterday", current: false },
];
