"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@trading-os/design-system";
import type { AccountComplianceBundle } from "../lib/actions";
import { useCreateAccount, useRuleSets } from "../hooks/useAccounts";
import { getBlankAccountFormValues } from "../lib/formDefaults";
import { AccountCard } from "./AccountCard";
import { AccountForm } from "./AccountForm";

export function AccountList({ bundles }: { bundles: AccountComplianceBundle[] }) {
  const [formOpen, setFormOpen] = React.useState(false);
  const { data: ruleSets = [] } = useRuleSets();
  const createAccount = useCreateAccount();

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-text-primary">Accounts</h1>
        <Button size="sm" onClick={() => setFormOpen(true)}>
          <Plus className="h-3.5 w-3.5" />
          Add Account
        </Button>
      </div>

      {bundles.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border-subtle p-10 text-center text-text-muted">
          No accounts yet. Add your first live, demo, or prop-firm account to start tracking it separately.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bundles.map((bundle) => (
            <AccountCard key={bundle.account.id} bundle={bundle} />
          ))}
        </div>
      )}

      <AccountForm
        open={formOpen}
        onOpenChange={setFormOpen}
        defaultValues={getBlankAccountFormValues()}
        ruleSets={ruleSets}
        isSubmitting={createAccount.isPending}
        title="New Account"
        onSubmit={async (values) => {
          await createAccount.mutateAsync(values);
          setFormOpen(false);
        }}
      />
    </div>
  );
}
