"use client";

import { ShieldAlert } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@trading-os/design-system";
import { AppearanceSettings } from "./AppearanceSettings";
import { CustomFieldsManager } from "./CustomFieldsManager";

export function SettingsView() {
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-lg font-semibold text-text-primary">Settings</h1>

      <AppearanceSettings />
      <CustomFieldsManager />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-warning" />
            Account & Security
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-text-muted">
            This build runs in single-user demo mode against in-memory repositories, so there's no real account to secure yet —
            every screen you've used operates as one hardcoded demo user. The <code className="font-tabular">AuthService</code>{" "}
            port (email/password sign-in, session, and refresh-token contract) is defined in{" "}
            <code className="font-tabular">@trading-os/domain</code> for exactly this reason: every future call site can be written
            against a stable interface now. A working login screen deliberately isn't built yet — one that doesn't check real
            credentials against a real user table would be exactly the kind of placeholder this codebase has avoided everywhere
            else. It ships once <code className="font-tabular">persistence-postgres</code> is wired to a real database and there's
            an actual user to authenticate. Billing follows the same reasoning: the <code className="font-tabular">Billing</code>{" "}
            bounded context is named in ARCHITECTURE.md's context table, with Stripe subscriptions and usage limits as the intended
            design — not built until there's a real customer record to bill.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
