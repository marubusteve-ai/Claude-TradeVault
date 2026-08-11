import { AppShell } from "@/components/AppShell";
import { AIInsightsView } from "@/features/ai-insights/components/AIInsightsView";

export default function InsightsPage() {
  const aiEnabled = Boolean(process.env.ANTHROPIC_API_KEY);

  return (
    <AppShell>
      <AIInsightsView aiEnabled={aiEnabled} />
    </AppShell>
  );
}
