import { AppShell } from "@/components/AppShell";
import { PsychologyView } from "@/features/psychology/components/PsychologyView";
import { listPsychologyEntriesAction, getBehavioralAnalyticsAction } from "@/features/psychology/lib/actions";

export default async function PsychologyPage() {
  const [entries, analytics] = await Promise.all([listPsychologyEntriesAction(), getBehavioralAnalyticsAction()]);

  return (
    <AppShell>
      <PsychologyView initialEntries={entries} analytics={analytics} />
    </AppShell>
  );
}
