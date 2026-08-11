"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Wallet,
  ShieldCheck,
  BookMarked,
  Brain,
  BarChart3,
  FileText,
  Sparkles,
  Settings,
  Moon,
  Sun,
  Command,
} from "lucide-react";
import { useThemeStore } from "@/lib/theme-store";
import { NotificationBell } from "@/components/NotificationBell";

interface NavItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  comingSoon?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Trade Journal", icon: BookOpen, href: "/journal" },
  { label: "Accounts", icon: Wallet, href: "/accounts" },
  { label: "Risk Management", icon: ShieldCheck, href: "/risk" },
  { label: "Playbook", icon: BookMarked, href: "/playbook" },
  { label: "Psychology", icon: Brain, href: "/psychology" },
  { label: "Analytics", icon: BarChart3, href: "/analytics" },
  { label: "Reports", icon: FileText, href: "/reports" },
  { label: "AI Insights", icon: Sparkles, href: "/insights" },
];

export function AppShell({ children, accountName }: { children: React.ReactNode; accountName?: string }) {
  const mode = useThemeStore((s) => s.mode);
  const toggleTheme = useThemeStore((s) => s.toggle);
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden bg-canvas">
      <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-surface max-lg:hidden">
        <div className="flex h-14 items-center gap-2 border-b border-border-subtle px-5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand text-brand-foreground">
            <span className="font-tabular text-sm font-bold">T</span>
          </div>
          <span className="text-sm font-semibold tracking-wide text-text-primary">TradeOS</span>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {NAV_ITEMS.map((item) => {
            const active = item.href !== "#" && pathname?.startsWith(item.href);
            if (item.comingSoon) {
              return (
                <button
                  key={item.label}
                  type="button"
                  disabled
                  title={`${item.label} — coming in a later phase`}
                  className="flex w-full cursor-not-allowed items-center gap-3 rounded-md px-3 py-2 text-sm text-text-muted/50"
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                  <span className="ml-auto text-[10px] uppercase tracking-wide text-text-muted/50">soon</span>
                </button>
              );
            }
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                  active ? "bg-brand/15 font-medium text-brand" : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border-subtle p-3">
          <Link
            href="/settings"
            className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
              pathname?.startsWith("/settings")
                ? "bg-brand/15 font-medium text-brand"
                : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
            }`}
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface px-5">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            {accountName && (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-profit" />
                <span className="font-medium text-text-primary">{accountName}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled
              title="Command palette — coming in a later phase"
              className="flex cursor-not-allowed items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs text-text-muted/50"
            >
              <Command className="h-3.5 w-3.5" />
              <span>K</span>
            </button>
            <NotificationBell />
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="rounded-md p-2 text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
            >
              {mode === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
