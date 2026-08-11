import { AppShell } from "@/components/AppShell";
import { StrategyList } from "@/features/playbook/components/StrategyList";
import { listStrategiesAction, getStrategyPerformanceAction } from "@/features/playbook/lib/actions";

export default async function PlaybookPage() {
  const strategies = await listStrategiesAction();
  const bundles = await Promise.all(strategies.map((s) => getStrategyPerformanceAction(s.id)));

  return (
    <AppShell>
      <StrategyList bundles={bundles} />
    </AppShell>
  );
}
