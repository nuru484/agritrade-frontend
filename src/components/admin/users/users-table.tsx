"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { ConsoleDataTable } from "@/components/admin/data-table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminCard, adminSelectClass } from "@/components/admin/ui";
import { DataTableSkeleton } from "@/components/ui/DataTableSkeleton";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import {
  useDeleteUserMutation,
  useGetUsersQuery,
} from "@/redux/users/users-api";
import { useConfirm } from "@/hooks/use-confirm";
import { useCurrentUser } from "@/hooks/use-current-user";
import { extractApiError } from "@/lib/extract-api-error";
import { notify } from "@/lib/notify";
import type { IUser } from "@/types/user.types";
import { UserActionsDropdown } from "./user-actions";
import {
  initialsOf,
  lastActiveLabel,
  ROLE_LABEL,
  StatusBadge,
  userStatus,
  visibilityLabel,
} from "./user-bits";

const ROLE_FILTERS = ["All roles", "Super admin", "Office staff", "Field agent"] as const;
const STATUS_FILTERS = ["All statuses", "Active", "Suspended", "Blocked"] as const;

const columnMeta = (opts?: { wide?: boolean }) => ({
  className: cn(
    "px-4 py-0 text-[13px]",
    opts?.wide ? "hidden xl:table-cell" : "table-cell",
  ),
  headerClassName:
    "h-[38px] whitespace-nowrap bg-slate-50 py-0 text-[10.5px] font-bold uppercase tracking-[0.09em] text-slate-500",
});

/**
 * The live Users register: same visual language as the config-driven register
 * template, but fed by GET /admin/users. The whole team fits one page, so
 * search and the role/status filters run client-side over the fetched list;
 * the navbar's global search (?q=) seeds the search box.
 */
export function UsersTable() {
  const { data, isLoading, isError, error, refetch } = useGetUsersQuery({
    limit: 100,
  });
  const me = useCurrentUser();
  const [deleteUser] = useDeleteUserMutation();
  const { confirm, confirmationDialog } = useConfirm();

  const deleteSelected = async (selected: IUser[], clear: () => void) => {
    const deletable = selected.filter((u) => u.id !== me?.id);
    if (deletable.length === 0) {
      notify.error("Nothing to delete", {
        description: "You cannot delete your own account.",
      });
      return;
    }
    const ok = await confirm({
      title: `Delete ${String(deletable.length)} selected user${deletable.length > 1 ? "s" : ""}?`,
      description:
        "This permanently removes their access and cannot be undone. Type 'delete selected' to confirm.",
      confirmText: "Delete selected",
      isDestructive: true,
      requireExactMatch: "delete selected",
    });
    if (!ok) return;
    try {
      await Promise.all(deletable.map((u) => deleteUser(u.id).unwrap()));
      clear();
      notify.success(
        `${String(deletable.length)} user${deletable.length > 1 ? "s" : ""} deleted`,
        selected.length !== deletable.length
          ? { description: "Your own account was skipped." }
          : undefined,
      );
    } catch (err) {
      notify.error("Couldn't delete every selected user", {
        description: extractApiError(err).message,
      });
    }
  };
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>(ROLE_FILTERS[0]);
  const [statusFilter, setStatusFilter] = useState<string>(STATUS_FILTERS[0]);

  // The navbar search lands here as ?q=… (deferred a tick so hydration
  // completes before the controlled value changes).
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q");
    if (!q) return;
    const timer = setTimeout(() => setQuery(q), 0);
    return () => clearTimeout(timer);
  }, []);

  const users = useMemo(() => {
    let rows = data?.data ?? [];
    if (roleFilter !== "All roles") {
      rows = rows.filter((u) => ROLE_LABEL[u.role] === roleFilter);
    }
    if (statusFilter !== "All statuses") {
      rows = rows.filter((u) => userStatus(u).label === statusFilter);
    }
    return rows;
  }, [data, roleFilter, statusFilter]);

  const columns = useMemo<ColumnDef<IUser, unknown>[]>(
    () => [
      {
        id: "user",
        accessorFn: (u) => `${u.firstName} ${u.lastName} ${u.email}`,
        header: "User",
        enableSorting: false,
        meta: columnMeta(),
        cell: ({ row }) => {
          const u = row.original;
          return (
            <Link
              href={`/admin/users/${u.id}`}
              className="outline-none focus-visible:underline"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="inline-flex max-w-full min-w-0 items-center gap-2">
                {u.profilePicture ? (
                  // eslint-disable-next-line @next/next/no-img-element -- avatar
                  <img
                    src={u.profilePicture}
                    alt=""
                    width={24}
                    height={24}
                    className="h-6 w-6 flex-none rounded-full object-cover"
                  />
                ) : (
                  <span className="font-adminmono inline-flex h-6 w-6 flex-none items-center justify-center rounded-full bg-console/10 text-[10px] font-bold text-console">
                    {initialsOf(u)}
                  </span>
                )}
                <span className="min-w-0">
                  <span className="block truncate font-medium text-slate-900">
                    {u.firstName} {u.lastName}
                  </span>
                  <span className="block truncate text-[11.5px] text-slate-400">
                    {u.email}
                  </span>
                </span>
              </span>
            </Link>
          );
        },
      },
      {
        id: "role",
        accessorFn: (u) => ROLE_LABEL[u.role],
        header: "Role",
        enableSorting: false,
        meta: columnMeta(),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-slate-700">
            {ROLE_LABEL[row.original.role]}
          </span>
        ),
      },
      {
        id: "phone",
        accessorFn: (u) => u.phone ?? "",
        header: "Phone",
        enableSorting: false,
        meta: columnMeta({ wide: true }),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-slate-700">
            {row.original.phone ?? "—"}
          </span>
        ),
      },
      {
        id: "visibility",
        accessorFn: visibilityLabel,
        header: "Visibility",
        enableSorting: false,
        meta: columnMeta(),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-slate-700">
            {visibilityLabel(row.original)}
          </span>
        ),
      },
      {
        id: "lastActive",
        accessorFn: lastActiveLabel,
        header: "Last active",
        enableSorting: false,
        meta: columnMeta({ wide: true }),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-slate-700">
            {lastActiveLabel(row.original)}
          </span>
        ),
      },
      {
        id: "status",
        accessorFn: (u) => userStatus(u).label,
        header: "Status",
        enableSorting: false,
        meta: columnMeta(),
        cell: ({ row }) => <StatusBadge user={row.original} />,
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        meta: { className: "w-10 pl-0 text-right" },
        cell: ({ row }) => <UserActionsDropdown user={row.original} />,
      },
    ],
    [],
  );

  return (
    <div>
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold tracking-[-0.01em] text-slate-900">
            Users
          </h1>
          <p className="mt-0.5 text-[13px] text-slate-500">
            Staff accounts and permissions
          </p>
        </div>
        <Link
          href="/admin/users/new"
          className="inline-flex h-[34px] items-center whitespace-nowrap rounded-[6px] bg-console px-4 text-[13.5px] font-semibold text-white transition-colors hover:bg-console-deep"
        >
          + Add user
        </Link>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <label className="flex h-8 w-full max-w-[250px] items-center gap-1.5 rounded-[6px] border border-slate-200 bg-white px-2.5 focus-within:border-console">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="7" cy="7" r="5" stroke="#9ba6b3" strokeWidth="1.5" />
            <path d="M11 11l3.2 3.2" stroke="#9ba6b3" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search user…"
            aria-label="Search users"
            className="h-full w-full min-w-0 rounded-none border-0 bg-transparent p-0 text-[13px] text-slate-900 outline-none placeholder:text-slate-300 focus-visible:ring-0 md:text-[13px]"
          />
        </label>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger
            aria-label="Filter by role"
            className={cn(adminSelectClass, "h-8 w-auto text-[13px] text-slate-700")}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLE_FILTERS.map((f) => (
              <SelectItem key={f} value={f}>
                {f}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger
            aria-label="Filter by status"
            className={cn(adminSelectClass, "h-8 w-auto text-[13px] text-slate-700")}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTERS.map((f) => (
              <SelectItem key={f} value={f}>
                {f}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <DataTableSkeleton />
      ) : isError ? (
        <ErrorMessage
          description={extractApiError(error).message}
          onRetry={() => void refetch()}
        />
      ) : (
        <AdminCard className="overflow-hidden">
          <ConsoleDataTable<IUser>
            columns={columns}
            data={users}
            itemNoun="users"
            globalFilter={query}
            enableSelection
            renderBulkActions={(selected, clear) => (
              <button
                type="button"
                onClick={() => void deleteSelected(selected, clear)}
                className="inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-[6px] bg-console-red px-2.5 text-[12px] font-semibold text-white hover:bg-console-red-deep"
              >
                Delete selected
              </button>
            )}
            rowHref={(u) => `/admin/users/${u.id}`}
            rowClassName={() => "h-12 hover:bg-slate-50/70"}
            emptyState={
              <div className="px-6 py-14 text-center">
                <div className="mb-1 text-[15px] font-bold text-slate-800">
                  {query ? "No matches" : "No users yet"}
                </div>
                <p className="text-[13.5px] text-slate-500">
                  {query
                    ? "Try a different search."
                    : "Add your first staff account to get started."}
                </p>
              </div>
            }
          />
        </AdminCard>
      )}
      {confirmationDialog}
    </div>
  );
}
