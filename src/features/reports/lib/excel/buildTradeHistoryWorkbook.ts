import ExcelJS from "exceljs";
import { Trade } from "@trading-os/domain";
import type { TradeRecord } from "@trading-os/shared-types";

export async function buildTradeHistoryWorkbook(accountName: string, records: TradeRecord[]): Promise<ExcelJS.Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "TradeOS";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Trade History");
  sheet.columns = [
    { header: "Exit Date", key: "exitTime", width: 14 },
    { header: "Instrument", key: "instrument", width: 12 },
    { header: "Asset Class", key: "assetClass", width: 12 },
    { header: "Direction", key: "direction", width: 10 },
    { header: "Entry Price", key: "entryPrice", width: 12 },
    { header: "Exit Price", key: "exitPrice", width: 12 },
    { header: "Quantity", key: "quantity", width: 12 },
    { header: "Net P&L", key: "netPnL", width: 14 },
    { header: "R-Multiple", key: "rMultiple", width: 12 },
    { header: "Outcome", key: "outcome", width: 12 },
    { header: "Strategy", key: "strategyId", width: 20 },
    { header: "Session", key: "session", width: 14 },
    { header: "Rating", key: "rating", width: 10 },
    { header: "Comment", key: "comment", width: 40 },
  ];
  sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1B2333" } };
  sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  sheet.views = [{ state: "frozen", ySplit: 1 }];

  for (const record of records) {
    const trade = Trade.fromRecord(record);
    const netPnL = trade.netPnL?.toMajor() ?? null;
    const row = sheet.addRow({
      exitTime: record.exitTime ? new Date(record.exitTime).toLocaleDateString() : "",
      instrument: record.instrument,
      assetClass: record.assetClass,
      direction: record.direction,
      entryPrice: record.entryPrice ?? "",
      exitPrice: record.exitPrice ?? "",
      quantity: record.quantity,
      netPnL,
      rMultiple: trade.rMultipleAchieved,
      outcome: trade.outcome ?? "",
      strategyId: record.strategyId ?? "",
      session: record.session ?? "",
      rating: record.rating ?? "",
      comment: record.comment ?? "",
    });

    row.getCell("netPnL").numFmt = '"$"#,##0.00;[Red]-"$"#,##0.00';
    if (netPnL != null) {
      row.getCell("netPnL").font = { color: { argb: netPnL >= 0 ? "FF0E9F6E" : "FFC2373F" } };
    }
    row.getCell("rMultiple").numFmt = '0.00"R"';
  }

  sheet.autoFilter = { from: "A1", to: `N${records.length + 1}` };

  const summarySheet = workbook.addWorksheet("Summary");
  summarySheet.columns = [
    { header: "Metric", key: "metric", width: 24 },
    { header: "Value", key: "value", width: 20 },
  ];
  summarySheet.getRow(1).font = { bold: true };
  summarySheet.addRow({ metric: "Account", value: accountName });
  summarySheet.addRow({ metric: "Total Trades Exported", value: records.length });
  summarySheet.addRow({ metric: "Generated", value: new Date().toLocaleString() });

  return workbook.xlsx.writeBuffer();
}
