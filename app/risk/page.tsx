import { AppShell } from "@/components/AppShell";
import { RiskManagementView } from "@/features/risk-management/components/RiskManagementView";
import { getRiskDashboardAction } from "@/features/risk-management/lib/actions";

export default async function RiskPage() {
  const accounts = await getRiskDashboardAction();

  return (
    <AppShell>
      <RiskManagementView accounts={accounts} />
    </AppShell>
  );
}
