import { AppShell } from "@/components/AppShell";
import { ReportsView } from "@/features/reports/components/ReportsView";
import { accountRepository } from "@/lib/repositories";
import { DEMO_USER_ID } from "@/lib/demo-data";

export default async function ReportsPage() {
  const accounts = await accountRepository.findByUser(DEMO_USER_ID);

  return (
    <AppShell>
      <ReportsView accounts={accounts} />
    </AppShell>
  );
}
