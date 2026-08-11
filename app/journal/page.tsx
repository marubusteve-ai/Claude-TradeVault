import { AppShell } from "@/components/AppShell";
import { JournalView } from "@/features/trade-journal/components/JournalView";
import { listTradesAction } from "@/features/trade-journal/lib/actions";
import { DEMO_ACCOUNT, DEMO_ACCOUNT_ID } from "@/lib/demo-data";

export default async function JournalPage() {
  const trades = await listTradesAction(DEMO_ACCOUNT_ID);

  return (
    <AppShell accountName={DEMO_ACCOUNT.name}>
      <JournalView accountId={DEMO_ACCOUNT_ID} initialTrades={trades} />
    </AppShell>
  );
}
