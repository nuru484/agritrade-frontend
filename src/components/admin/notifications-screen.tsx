"use client";

import { useState } from "react";
import { AdminButton, AdminCard, AdminPageHeader } from "@/components/admin/ui";
import { consoleNotifications, type ConsoleNotification } from "@/static-data/admin/inbox";
import { cn } from "@/lib/utils";

export function NotificationsScreen() {
  const [items, setItems] = useState<ConsoleNotification[]>(consoleNotifications);
  const unread = items.filter((n) => n.unread).length;

  const markRead = (id: number) =>
    setItems((ns) => ns.map((n) => (n.id === id ? { ...n, unread: false } : n)));

  return (
    <div className="max-w-[680px]">
      <AdminPageHeader
        title="Notifications"
        sub={`${unread} unread`}
        actions={
          <AdminButton
            variant="secondary"
            className="h-[34px] px-3.5 text-[13px] whitespace-nowrap"
            onClick={() => setItems((ns) => ns.map((n) => ({ ...n, unread: false })))}
          >
            Mark all read
          </AdminButton>
        }
      />

      <AdminCard className="overflow-hidden">
        {items.map((n) => (
          <AdminButton
            key={n.id}
            variant="ghost"
            onClick={() => markRead(n.id)}
            className={cn(
              "flex h-auto w-full cursor-pointer items-stretch justify-start gap-3 rounded-none border-0 border-b border-soil/15 px-4 py-[13px] text-left font-normal whitespace-normal last:border-b-0",
              n.unread ? "bg-[#FDFBF5] hover:bg-[#FDFBF5]" : "bg-transparent hover:bg-surface-alt/70",
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "mt-1.5 h-2 w-2 flex-none rounded-full",
                n.unread ? "bg-console-gold" : "bg-soil/20",
              )}
            />
            <span className="min-w-0 flex-1">
              <span
                className={cn(
                  "block text-[13.5px] text-ink",
                  n.unread ? "font-semibold" : "font-normal",
                )}
              >
                {n.title}
              </span>
              <span className="mt-0.5 block text-[12px] text-soil">{n.meta}</span>
            </span>
          </AdminButton>
        ))}
      </AdminCard>
    </div>
  );
}
