"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useNotifications } from "@/features/risk-management/hooks/useRiskManagement";

export function NotificationBell() {
  const { data: notifications = [] } = useNotifications();
  const unreadCount = notifications.filter((n) => !n.readAt).length;

  return (
    <Link
      href="/risk"
      className="relative rounded-md p-2 text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
      aria-label={`${unreadCount} unread alerts`}
    >
      <Bell className="h-4 w-4" />
      {unreadCount > 0 && (
        <span className="absolute right-1 top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-loss text-[9px] font-bold text-white">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
