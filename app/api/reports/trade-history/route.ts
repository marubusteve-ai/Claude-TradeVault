import { Trade } from "@trading-os/domain";
import { getTradeHistoryData } from "@/features/reports/lib/reportData";
import { buildTradeHistoryWorkbook } from "@/features/reports/lib/excel/buildTradeHistoryWorkbook";
import { accountRepository } from "@/lib/repositories";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const accountId = searchParams.get("accountId");
  const format = searchParams.get("format") ?? "excel";
  if (!accountId) return new Response("accountId is required", { status: 400 });

  const account = await accountRepository.findById(accountId);
  if (!account) return new Response("Account not found", { status: 404 });

  const records = await getTradeHistoryData(accountId);

  if (format === "json") {
    const enriched = records.map((r) => {
      const trade = Trade.fromRecord(r);
      return { ...r, computed: { netPnL: trade.netPnL?.toMajor() ?? null, rMultiple: trade.rMultipleAchieved, outcome: trade.outcome } };
    });
    return new Response(JSON.stringify({ account: account.name, generatedAt: new Date().toISOString(), trades: enriched }, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="trade-history-${accountId}.json"`,
      },
    });
  }

  const buffer = await buildTradeHistoryWorkbook(account.name, records);
  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="trade-history-${accountId}.xlsx"`,
    },
  });
}
