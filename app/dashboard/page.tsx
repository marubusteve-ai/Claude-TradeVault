import { AppShell } from "@/components/AppShell";
import { DashboardView } from "@/features/dashboard/components/DashboardView";
import { getDashboardData } from "@/features/dashboard/lib/getDashboardData";
import { DEMO_ACCOUNT_ID } from "@/lib/demo-data";

export default async function DashboardPage() {
  const data = await getDashboardData(DEMO_ACCOUNT_ID);

  return (
    <AppShell accountName={data.account.name}>
      <DashboardView data={data} />
    </AppShell>
  );
}
