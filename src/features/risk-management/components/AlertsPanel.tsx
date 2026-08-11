"use client";

import { AlertTriangle, XCircle, Info, CheckCheck, RefreshCw } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from "@trading-os/design-system";
import type { NotificationRecord } from "@trading-os/shared-types";
import { useNotifications, useMarkNotificationRead, useGenerateRiskAlerts } from "../hooks/useRiskManagement";

const SEVERITY_ICON = { info: Info, warning: AlertTriangle, critical: XCircle };
const SEVERITY_COLOR = { info: "text-info", warning: "text-warning", critical: "text-loss" };
const SEVERITY_BADGE: Record<string, "brand" | "warning" | "loss"> = { info: "brand", warning: "warning", critical: "loss" };

export function AlertsPanel() {
  const { data: notifications = [] } = useNotifications();
  const markRead = useMarkNotificationRead();
  const generateAlerts = useGenerateRiskAlerts();

  const unread = notifications.filter((n: NotificationRecord) => !n.readAt);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alerts {unread.length > 0 && `(${unread.length})`}</CardTitle>
        <Button size="sm" variant="ghost" onClick={() => generateAlerts.mutate()} disabled={generateAlerts.isPending}>
          <RefreshCw className={`h-3.5 w-3.5 ${generateAlerts.isPending ? "animate-spin" : ""}`} />
          Scan Now
        </Button>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <p className="text-sm text-text-muted">
            No alerts yet. The automatic warning system scans every account's rule set against{" "}
            <code className="font-tabular">ComplianceEvaluator</code> — click "Scan Now" to run it, or it runs automatically on a
            schedule once the backend exists.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {notifications.map((n: NotificationRecord) => {
              const Icon = SEVERITY_ICON[n.severity];
              return (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 rounded-md border px-3 py-2.5 ${n.readAt ? "border-border-subtle opacity-60" : "border-border"}`}
                >
                  <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${SEVERITY_COLOR[n.severity]}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-text-primary">{n.title}</span>
                      <Badge variant={SEVERITY_BADGE[n.severity]}>{n.severity}</Badge>
                    </div>
                    {n.body && <p className="mt-0.5 text-xs text-text-muted">{n.body}</p>}
                  </div>
                  {!n.readAt && (
                    <button
                      type="button"
                      onClick={() => markRead.mutate(n.id)}
                      aria-label="Mark as read"
                      className="shrink-0 rounded p-1 text-text-muted hover:bg-surface-hover hover:text-text-primary"
                    >
                      <CheckCheck className="h-4 w-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
