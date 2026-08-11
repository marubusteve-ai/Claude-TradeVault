import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { StrategyDetail } from "@/features/playbook/components/StrategyDetail";
import { getStrategyPerformanceAction } from "@/features/playbook/lib/actions";

export default async function StrategyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bundle = await getStrategyPerformanceAction(id);

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <Link href="/playbook" className="flex w-fit items-center gap-1 text-sm text-text-muted hover:text-text-primary">
          <ChevronLeft className="h-4 w-4" />
          All Strategies
        </Link>
        <StrategyDetail bundle={bundle} />
      </div>
    </AppShell>
  );
}
