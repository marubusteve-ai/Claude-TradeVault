import { AppShell } from "@/components/AppShell";
import { AccountList } from "@/features/accounts/components/AccountList";
import { listAccountsAction, getAccountComplianceAction } from "@/features/accounts/lib/actions";

export default async function AccountsPage() {
  const accounts = await listAccountsAction();
  const bundles = await Promise.all(accounts.map((a) => getAccountComplianceAction(a.id)));

  return (
    <AppShell>
      <AccountList bundles={bundles} />
    </AppShell>
  );
}
