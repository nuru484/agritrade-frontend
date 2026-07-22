/**
 * The console's navigation registry (from the DB Plus Console design): five
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

/**
 * Only BUILT modules appear in the rail - the sidebar is the honest map of
 * what the system can do today, so an unbuilt tab never masquerades as a
 * feature. Re-enable each commented entry in the step that ships it:
 *
 *   Step 3  - stock, approvals (+ badge), the approvals mobile tab
 *   Step 4  - sales
 *   Step 5  - shipments, expenses
 *   Step 7  - notifications (+ topbar bell)
 *   Step 8  - reports (dashboard goes live the same step)
 *   Step 9  - plots, land-sales (Land & Farm group returns)
 *   Step 10 - seasons, farmers, grants, repayments
 */
export const adminNavGroups: AdminNavGroup[] = [
  {
    label: "Overview",
    items: [
      item("dashboard", "Dashboard"),
      // item("approvals", "Approvals", "approvals"),
      // item("reports", "Reports"),
    ],
  },
  {
    label: "Trading",
    items: [
      item("purchases", "Purchases"),
      // item("sales", "Sales"),
      // item("shipments", "Shipments"),
      // item("stock", "Stock"),
      item("commodities", "Commodities"),
      item("warehouses", "Warehouses"),
      item("agents", "Agents & Floats"),
      // item("expenses", "Expenses"),
      item("expense-categories", "Expense Categories"),
    ],
  },
  // Land & Farm group returns with the land module (Step 9):
  // { label: "Land & Farm", items: [plots, land-sales, seasons, farmers, grants, repayments] },
  {
    label: "Directory",
    items: [item("suppliers", "Suppliers"), item("buyers", "Buyers")],
  },
  {
    label: "Admin",
    items: [
      item("users", "Users"),
      item("audit", "Audit Log"),
      // item("notifications", "Notifications"),
      // "My profile" and "Settings" deliberately absent: both live behind
      // the navbar avatar menu (dms-frontend convention), not the rail.
    ],
  },
];

/**
 * Pending-approvals badge count. Zero until the approvals module ships
 * (Step 3) - a fake number on the bell/tab would advertise an unbuilt
 * feature, exactly what the trimmed rail exists to prevent.
 */
export const PENDING_APPROVALS = 0;

/** Resolve the active nav key for a pathname (details map to their register). */
export function activeNavKey(pathname: string): string {
  if (pathname === ADMIN_HOME) return "dashboard";
  const segment = pathname.slice(ADMIN_HOME.length + 1).split("/")[0] ?? "";
  return segment || "dashboard";
}

/** Breadcrumb title for the topbar. */
export function screenTitle(pathname: string): string {
  const key = activeNavKey(pathname);
  // settings: fall back gracefully now that it lives outside the nav groups.
  if (key === "settings") return "Settings";
  if (key === "profile") return "My profile";
  for (const group of adminNavGroups) {
    const found = group.items.find((i) => i.key === key);
    if (found) return found.label;
  }
  return "Console";
}
