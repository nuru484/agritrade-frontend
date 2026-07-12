"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  ADMIN_HOME,
  activeNavKey,
  adminNavGroups,
  PENDING_APPROVALS,
  screenTitle,
} from "@/static-data/admin/nav";
import { cn } from "@/lib/utils";

const APPROVALS_HREF = `${ADMIN_HOME}/approvals`;

/** Console-scoped shadcn sidebar tokens — white rail, slate lines, forest ring. */
const SIDEBAR_VARS = {
  "--sidebar-width": "224px",
  "--sidebar": "#ffffff",
  "--sidebar-foreground": "#334155",
  "--sidebar-border": "#e2e8f0",
  "--sidebar-accent": "#f1f5f9",
  "--sidebar-accent-foreground": "#334155",
  "--sidebar-primary": "#1E3D2B",
  "--sidebar-primary-foreground": "#ffffff",
  "--sidebar-ring": "#1E3D2B",
} as React.CSSProperties;

/** Gold count pill used on nav rows. */
function NavBadge({ count }: { count: number }) {
  return (
    <span className="font-adminmono rounded-full bg-console-gold px-[7px] py-px text-[10.5px] font-bold text-white">
      {count}
    </span>
  );
}

/** The rail itself — shadcn Sidebar pinned to the console's exact look.
 * On mobile shadcn renders it as a sheet, opened from the Menu tab below. */
function ConsoleSidebar({ activeKey }: { activeKey: string }) {
  const { setOpenMobile } = useSidebar();
  return (
    <Sidebar>
      <SidebarHeader className="gap-0 border-b border-slate-100 px-5 pb-4 pt-5">
        <div className="text-[16px] font-extrabold tracking-[0.14em] text-console">
          NASARA
        </div>
        <div className="mt-0.5 text-[11px] uppercase tracking-[0.06em] text-slate-500">
          Agro Trading · Tamale
        </div>
      </SidebarHeader>
      <SidebarContent className="gap-0.5 px-1 pb-6 pt-2.5 [scrollbar-width:none]">
        {adminNavGroups.map((group) => (
          <SidebarGroup key={group.label} className="gap-px py-0">
            <SidebarGroupLabel className="h-auto px-2.5 pb-[5px] pt-3.5 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-slate-400">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-px">
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton
                      asChild
                      isActive={activeKey === item.key}
                      className="h-auto justify-between gap-2 rounded-[6px] px-2.5 py-[7px] text-[13.5px] font-normal text-slate-700 hover:bg-slate-100 hover:text-slate-700 data-[active=true]:bg-console data-[active=true]:font-semibold data-[active=true]:text-white"
                    >
                      <Link
                        href={item.href}
                        onClick={() => setOpenMobile(false)}
                      >
                        <span className="whitespace-nowrap">{item.label}</span>
                        {item.badge === "approvals" && PENDING_APPROVALS > 0 ? (
                          <NavBadge count={PENDING_APPROVALS} />
                        ) : null}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t border-slate-100 p-0">
        <Link
          href={`${ADMIN_HOME}/profile`}
          onClick={() => setOpenMobile(false)}
          className="flex items-center gap-2.5 px-5 py-3.5 hover:bg-slate-50"
        >
          <span className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-full bg-console text-[12px] font-bold text-white">
            AD
          </span>
          <span className="min-w-0 flex-1">
            <span className="block whitespace-nowrap text-[13px] font-semibold text-slate-800">
              Abdul Danaa
            </span>
            <span className="block text-[11px] text-slate-500">
              Owner · View profile
            </span>
          </span>
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}

const MOBILE_TABS = [
  { key: "dashboard", label: "Dashboard", href: ADMIN_HOME, icon: "▦" },
  { key: "approvals", label: "Approvals", href: APPROVALS_HREF, icon: "✓" },
  { key: "purchases", label: "Purchases", href: `${ADMIN_HOME}/purchases`, icon: "⇄" },
] as const;

/** Bottom tabs (mobile) — the Menu tab opens the shadcn sidebar sheet. */
function MobileTabs({ activeKey }: { activeKey: string }) {
  const { openMobile, setOpenMobile } = useSidebar();
  return (
    <nav
      aria-label="Console quick navigation"
      className="fixed inset-x-0 bottom-0 z-[60] grid h-[62px] grid-cols-4 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      {MOBILE_TABS.map((tab) => {
        const active = activeKey === tab.key && !openMobile;
        return (
          <Link
            key={tab.key}
            href={tab.href}
            onClick={() => setOpenMobile(false)}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex flex-col items-center justify-center gap-[3px]",
              active ? "text-console" : "text-slate-400",
            )}
          >
            <span aria-hidden="true" className="text-[18px] leading-none">
              {tab.icon}
            </span>
            <span className="text-[10.5px] font-semibold">{tab.label}</span>
            {tab.key === "approvals" && PENDING_APPROVALS > 0 ? (
              <span className="font-adminmono absolute right-[24%] top-2 flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-console-red text-[9.5px] font-bold text-white">
                {PENDING_APPROVALS}
              </span>
            ) : null}
          </Link>
        );
      })}
      <button
        type="button"
        onClick={() => setOpenMobile(true)}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-[3px]",
          openMobile ? "text-console" : "text-slate-400",
        )}
      >
        <span aria-hidden="true" className="text-[18px] leading-none">
          ☰
        </span>
        <span className="text-[10.5px] font-semibold">Menu</span>
      </button>
    </nav>
  );
}

/**
 * The console chrome (from the Nasara Console design), built on the shadcn
 * Sidebar: 224px white rail with grouped nav + profile footer, a 54px
 * breadcrumb topbar with search and the approvals bell, and — on mobile —
 * bottom tabs whose Menu tab opens the sidebar as a sheet.
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const activeKey = activeNavKey(pathname);
  const title = screenTitle(pathname);

  return (
    <SidebarProvider style={SIDEBAR_VARS}>
      <ConsoleSidebar activeKey={activeKey} />

      <SidebarInset className="bg-transparent pb-[62px] md:pb-0">
        <header className="sticky top-0 z-40 flex h-[54px] flex-none items-center gap-3 border-b border-slate-200 bg-white px-4 lg:px-[26px]">
          <div className="flex min-w-0 items-center gap-1.5 overflow-hidden whitespace-nowrap text-[13px] text-slate-500">
            <span className="text-slate-400 max-sm:hidden">Nasara Agro</span>
            <span className="text-slate-300 max-sm:hidden">/</span>
            <span className="overflow-hidden text-ellipsis font-semibold text-slate-800">
              {title}
            </span>
          </div>
          <div className="flex-1" />
          <div className="hidden h-8 w-[260px] cursor-text items-center gap-2 rounded-[6px] border border-slate-200 bg-slate-50 px-2.5 text-[13px] text-slate-400 xl:flex">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M11 11l3.2 3.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="flex-1">Search purchases, agents, buyers…</span>
            <span className="font-adminmono rounded-[4px] border border-slate-200 bg-white px-[5px] text-[11px]">
              ⌘K
            </span>
          </div>
          <Link
            href={APPROVALS_HREF}
            aria-label={`Approvals — ${String(PENDING_APPROVALS)} pending`}
            className="relative flex h-[34px] w-[34px] items-center justify-center rounded-[6px] border border-slate-200 bg-white hover:bg-slate-50"
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="M10 2.5a5 5 0 0 0-5 5v3l-1.5 3h13L15 10.5v-3a5 5 0 0 0-5-5Z"
                stroke="#4c5765"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path d="M8 16a2 2 0 0 0 4 0" stroke="#4c5765" strokeWidth="1.5" />
            </svg>
            {PENDING_APPROVALS > 0 ? (
              <span className="font-adminmono absolute -right-[5px] -top-[5px] flex h-4 min-w-4 items-center justify-center rounded-full bg-console-red px-1 text-[10px] font-bold text-white">
                {PENDING_APPROVALS}
              </span>
            ) : null}
          </Link>
        </header>

        <main className="mx-auto w-full max-w-[1360px] flex-1 p-4 lg:p-[26px]">
          {children}
        </main>
      </SidebarInset>

      <MobileTabs activeKey={activeKey} />
    </SidebarProvider>
  );
}
