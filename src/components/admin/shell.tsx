"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, Settings, User as UserIcon, X } from "lucide-react";
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
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ADMIN_HOME,
  activeNavKey,
  adminNavGroups,
  PENDING_APPROVALS,
  screenTitle,
} from "@/static-data/admin/nav";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useConfirm } from "@/hooks/use-confirm";
import { useLogoutMutation } from "@/redux/auth/auth-api";
import { notify } from "@/lib/notify";
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

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: "Super admin",
  STAFF: "Office staff",
  AGENT: "Field agent",
};

/** Shared sign-out flow: confirm, call the API (client session clears
 * regardless of the server result), land on /login. */
function useSignOut() {
  const router = useRouter();
  const { confirm, confirmationDialog } = useConfirm();
  const [logout, { isLoading }] = useLogoutMutation();

  const signOut = async () => {
    const ok = await confirm({
      title: "Sign out?",
      description: "You'll need your password to sign back in.",
      confirmText: "Sign out",
    });
    if (!ok) return;
    await logout()
      .unwrap()
      .catch(() => {});
    notify.success("Signed out");
    router.replace("/login");
  };

  return { signOut, isLoading, confirmationDialog };
}

/** Initials-or-photo avatar used by the navbar menu. */
function UserAvatar({ size = 30 }: { size?: number }) {
  const user = useCurrentUser();
  const initials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : "··";
  if (user?.profilePicture) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- Cloudinary URL, avatar-sized
      <img
        src={user.profilePicture}
        alt=""
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className="flex flex-none items-center justify-center rounded-full bg-console font-bold text-white"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials}
    </span>
  );
}

/** Top-right profile menu (dms-frontend convention): avatar trigger opening
 * an account card with the profile link and sign out. */
function NavbarUser() {
  const user = useCurrentUser();
  const router = useRouter();
  const { signOut, isLoading, confirmationDialog } = useSignOut();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Account menu"
          className="cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-console/40"
        >
          <UserAvatar size={32} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60 border-slate-200 p-0">
          <div className="flex items-center gap-2.5 border-b border-slate-100 px-3.5 py-3">
            <UserAvatar size={38} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-semibold text-slate-800">
                {user ? `${user.firstName} ${user.lastName}` : "Signed in"}
              </div>
              <div className="truncate text-[11.5px] text-slate-500">
                {user?.email ?? ""}
              </div>
              <div className="text-[11px] text-slate-400">
                {(user && ROLE_LABEL[user.role]) ?? ""}
              </div>
            </div>
          </div>
          <div className="p-1">
            <DropdownMenuItem
              className="cursor-pointer gap-2 text-[13px]"
              onClick={() => router.push(`${ADMIN_HOME}/profile`)}
            >
              <UserIcon className="h-3.5 w-3.5" aria-hidden="true" />
              My profile
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer gap-2 text-[13px]"
              onClick={() => router.push(`${ADMIN_HOME}/settings`)}
            >
              <Settings className="h-3.5 w-3.5" aria-hidden="true" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled={isLoading}
              className="cursor-pointer gap-2 text-[13px] text-console-red focus:text-console-red"
              onClick={() => void signOut()}
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              Sign out
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
      {confirmationDialog}
    </>
  );
}

/**
 * The navbar search. Type + Enter navigates to the current screen with
 * `?q=<term>` (screens read it as their initial filter); the X clears both
 * the box and the param. The placeholder never wraps — it truncates.
 */
function NavbarSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const [term, setTerm] = useState("");

  // Initialise from the URL once on mount (window, not useSearchParams, so the
  // statically-rendered admin pages don't pick up a CSR bailout). Deferred a
  // tick so hydration completes before the controlled value changes.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q");
    if (!q) return;
    const timer = setTimeout(() => setTerm(q), 0);
    return () => clearTimeout(timer);
  }, []);

  const submit = () => {
    const q = term.trim();
    router.push(q ? `${pathname}?q=${encodeURIComponent(q)}` : pathname);
  };

  const clear = () => {
    setTerm("");
    if (new URLSearchParams(window.location.search).has("q")) {
      router.push(pathname);
    }
  };

  return (
    <div className="hidden h-8 w-[210px] items-center gap-2 rounded-[6px] border border-slate-200 bg-slate-50 px-2.5 text-[13px] focus-within:border-console focus-within:bg-white md:flex lg:w-[260px]">
      <svg
        width="13"
        height="13"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
        className="flex-none text-slate-400"
      >
        <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M11 11l3.2 3.2"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      <input
        type="search"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
          if (e.key === "Escape") clear();
        }}
        placeholder="Search purchases, agents, buyers…"
        aria-label="Search the console"
        className="[&::-webkit-search-cancel-button]:hidden h-full w-full min-w-0 truncate bg-transparent text-slate-900 outline-none placeholder:truncate placeholder:whitespace-nowrap placeholder:text-slate-300"
      />
      {term ? (
        <button
          type="button"
          onClick={clear}
          aria-label="Clear search"
          className="flex h-4 w-4 flex-none cursor-pointer items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600"
        >
          <X className="h-3 w-3" aria-hidden="true" />
        </button>
      ) : (
        <span className="font-adminmono flex-none rounded-[4px] border border-slate-200 bg-white px-[5px] text-[11px] text-slate-400">
          ⌘K
        </span>
      )}
    </div>
  );
}

/** Gold count pill used on nav rows. */
function NavBadge({ count }: { count: number }) {
  return (
    <span className="font-adminmono rounded-full bg-console-gold px-[7px] py-px text-[10.5px] font-bold text-white">
      {count}
    </span>
  );
}

/** Sign-out row anchoring the rail (the profile itself lives in the navbar menu). */
function SidebarSignOut() {
  const { signOut, isLoading, confirmationDialog } = useSignOut();
  return (
    <>
      <button
        type="button"
        onClick={() => void signOut()}
        disabled={isLoading}
        className="flex w-full cursor-pointer items-center gap-2.5 px-5 py-3.5 text-left text-[13px] font-semibold text-slate-600 hover:bg-slate-50 hover:text-console-red disabled:opacity-50"
      >
        <LogOut className="h-[15px] w-[15px]" aria-hidden="true" />
        Sign out
      </button>
      {confirmationDialog}
    </>
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
          DB PLUS
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
        <SidebarSignOut />
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
 * The console chrome (from the DB Plus Console design), built on the shadcn
 * Sidebar: 224px white rail with grouped nav + a sign-out footer, a 54px
 * breadcrumb topbar with live search, the notifications bell and the account
 * menu (top right, dms-frontend style), and — on mobile — bottom tabs whose
 * Menu tab opens the sidebar as a sheet.
 */
/** Breadcrumb beside the rail trigger: DB Plus / Section / (New | Detail).
 * The section links back to its register when a sub-page is open, and the
 * trail never disappears — on tiny widths only the brand root hides. */
function Crumbs() {
  const pathname = usePathname();
  const title = screenTitle(pathname);
  const segments = pathname
    .slice(ADMIN_HOME.length)
    .split("/")
    .filter(Boolean);
  const section = segments[0];
  const sub =
    segments.length > 1 ? (segments[1] === "new" ? "New" : "Detail") : null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex min-w-0 items-center gap-1.5 overflow-hidden whitespace-nowrap text-[13px] text-slate-500"
    >
      <span className="text-slate-400 max-sm:hidden">DB Plus</span>
      <span className="text-slate-300 max-sm:hidden">/</span>
      {sub && section ? (
        <>
          <Link
            href={`${ADMIN_HOME}/${section}`}
            className="text-slate-500 transition-colors hover:text-console"
          >
            {title}
          </Link>
          <span className="text-slate-300">/</span>
          <span
            aria-current="page"
            className="overflow-hidden text-ellipsis font-semibold text-slate-800"
          >
            {sub}
          </span>
        </>
      ) : (
        <span
          aria-current="page"
          className="overflow-hidden text-ellipsis font-semibold text-slate-800"
        >
          {title}
        </span>
      )}
    </nav>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const activeKey = activeNavKey(pathname);

  return (
    <SidebarProvider style={SIDEBAR_VARS}>
      <ConsoleSidebar activeKey={activeKey} />

      <SidebarInset className="min-w-0 bg-transparent pb-[62px] md:pb-0">
        <header className="sticky top-0 z-40 flex h-[54px] flex-none items-center gap-3 border-b border-slate-200 bg-white px-4 lg:px-[26px]">
          {/* Collapse/expand the rail (sheet on mobile) — dms behaviour in the
              console skin, living on the topbar's left edge. */}
          <SidebarTrigger className="h-[30px] w-[30px] flex-none cursor-pointer rounded-[6px] border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-console max-md:hidden" />
          <Crumbs />
          <div className="flex-1" />
          <NavbarSearch />
          {/* Notifications: intentionally inert until the notifications feed
              ships — it must NOT navigate anywhere. */}
          <button
            type="button"
            aria-label={`Notifications — ${String(PENDING_APPROVALS)} pending`}
            className="relative flex h-[34px] w-[34px] flex-none cursor-pointer items-center justify-center rounded-[6px] border border-slate-200 bg-white hover:bg-slate-50"
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
          </button>
          <NavbarUser />
        </header>

        <main className="mx-auto w-full min-w-0 max-w-[1360px] flex-1 p-4 lg:p-[26px]">
          {children}
        </main>
      </SidebarInset>

      <MobileTabs activeKey={activeKey} />
    </SidebarProvider>
  );
}
