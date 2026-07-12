/**
 * The console's navigation registry (from the Nasara Console design): five
 * groups, one entry per module. `key` doubles as the register slug for the
 * config-driven modules; custom screens (dashboard, purchases, sales,
 * shipments, approvals, reports, settings, notifications, profile) have their
 * own routes.
 */
export interface AdminNavItem {
  key: string;
  label: string;
  href: string;
  /** Show the pending-approvals badge on this item. */
  badge?: "approvals";
}

export interface AdminNavGroup {
  label: string;
  items: AdminNavItem[];
}

export const ADMIN_HOME = "/admin";

const item = (key: string, label: string, badge?: "approvals"): AdminNavItem => ({
  key,
  label,
  href: key === "dashboard" ? ADMIN_HOME : `${ADMIN_HOME}/${key}`,
  badge,
});

export const adminNavGroups: AdminNavGroup[] = [
  {
    label: "Overview",
    items: [
      item("dashboard", "Dashboard"),
      item("approvals", "Approvals", "approvals"),
      item("reports", "Reports"),
    ],
  },
  {
    label: "Trading",
    items: [
      item("purchases", "Purchases"),
      item("sales", "Sales"),
      item("shipments", "Shipments"),
      item("stock", "Stock"),
      item("agents", "Agents & Floats"),
      item("expenses", "Expenses"),
    ],
  },
  {
    label: "Land & Farm",
    items: [
      item("plots", "Plots"),
      item("land-sales", "Land Sales"),
      item("seasons", "Seasons"),
      item("farmers", "Farmers"),
      item("grants", "Grants"),
      item("repayments", "Repayments"),
    ],
  },
  {
    label: "Directory",
    items: [item("suppliers", "Suppliers"), item("buyers", "Buyers")],
  },
  {
    label: "Admin",
    items: [
      item("users", "Users"),
      item("settings", "Settings"),
      item("audit", "Audit Log"),
      item("notifications", "Notifications"),
      item("profile", "My profile"),
    ],
  },
];

/** Number the bell + Approvals badge show until the backend supplies it. */
export const PENDING_APPROVALS = 5;

/** Resolve the active nav key for a pathname (details map to their register). */
export function activeNavKey(pathname: string): string {
  if (pathname === ADMIN_HOME) return "dashboard";
  const segment = pathname.slice(ADMIN_HOME.length + 1).split("/")[0] ?? "";
  return segment || "dashboard";
}

/** Breadcrumb title for the topbar. */
export function screenTitle(pathname: string): string {
  const key = activeNavKey(pathname);
  for (const group of adminNavGroups) {
    const found = group.items.find((i) => i.key === key);
    if (found) return found.label;
  }
  return "Console";
}
