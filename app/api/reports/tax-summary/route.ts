import { getTaxSummaryData } from "@/features/reports/lib/reportData";
import { buildTaxSummaryWorkbook } from "@/features/reports/lib/excel/buildTaxSummaryWorkbook";
import { accountRepository } from "@/lib/repositories";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const accountId = searchParams.get("accountId");
  const year = Number(searchParams.get("year")) || new Date().getFullYear();
  if (!accountId) return new Response("accountId is required", { status: 400 });

  const account = await accountRepository.findById(accountId);
  if (!account) return new Response("Account not found", { status: 404 });

  const rows = await getTaxSummaryData(accountId, year);
  const buffer = await buildTaxSummaryWorkbook(account.name, year, rows);

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="tax-summary-${year}-${accountId}.xlsx"`,
    },
  });
}
