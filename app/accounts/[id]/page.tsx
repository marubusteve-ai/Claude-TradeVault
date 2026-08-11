import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ComplianceDashboard } from "@/features/accounts/components/ComplianceDashboard";
import { PayoutList } from "@/features/accounts/components/PayoutList";
import { getAccountComplianceAction } from "@/features/accounts/lib/actions";

export default async function AccountDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bundle = await getAccountComplianceAction(id);

  return (
    <AppShell accountName={bundle.account.name}>
      <div className="flex flex-col gap-5">
        <Link href="/accounts" className="flex w-fit items-center gap-1 text-sm text-text-muted hover:text-text-primary">
          <ChevronLeft className="h-4 w-4" />
          All Accounts
        </Link>
        <ComplianceDashboard bundle={bundle} />
        {bundle.account.type === "prop_funded" && <PayoutList accountId={id} />}
      </div>
    </AppShell>
  );
}
