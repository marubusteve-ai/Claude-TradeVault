import ExcelJS from "exceljs";
import type { TaxSummaryRow } from "../reportData";

export async function buildTaxSummaryWorkbook(accountName: string, year: number, rows: TaxSummaryRow[]): Promise<ExcelJS.Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "TradeOS";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(`Tax Summary ${year}`);
  sheet.columns = [
    { header: "Quarter", key: "quarter", width: 12 },
    { header: "Realized Gains", key: "realizedGains", width: 18 },
    { header: "Realized Losses", key: "realizedLosses", width: 18 },
    { header: "Net Realized", key: "netRealized", width: 16 },
    { header: "Closed Trades", key: "tradeCount", width: 14 },
  ];

  sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1B2333" } };
  sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };

  for (const row of rows) {
    const excelRow = sheet.addRow(row);
    excelRow.getCell("realizedGains").numFmt = '"$"#,##0.00';
    excelRow.getCell("realizedLosses").numFmt = '"$"#,##0.00';
    excelRow.getCell("netRealized").numFmt = '"$"#,##0.00';
  }

  const totalRow = sheet.addRow({
    quarter: "Total",
    realizedGains: rows.reduce((s, r) => s + r.realizedGains, 0),
    realizedLosses: rows.reduce((s, r) => s + r.realizedLosses, 0),
    netRealized: rows.reduce((s, r) => s + r.netRealized, 0),
    tradeCount: rows.reduce((s, r) => s + r.tradeCount, 0),
  });
  totalRow.font = { bold: true };
  totalRow.getCell("realizedGains").numFmt = '"$"#,##0.00';
  totalRow.getCell("realizedLosses").numFmt = '"$"#,##0.00';
  totalRow.getCell("netRealized").numFmt = '"$"#,##0.00';

  sheet.addRow([]);
  const noteRow = sheet.addRow(["Account:", accountName]);
  noteRow.getCell(1).font = { italic: true, color: { argb: "FF8794B0" } };
  const disclaimerRow = sheet.addRow([
    "This summarizes realized P&L by quarter for record-keeping. It is not tax advice — consult a tax professional for filing guidance specific to your jurisdiction and instrument types.",
  ]);
  disclaimerRow.getCell(1).font = { italic: true, size: 9, color: { argb: "FF8794B0" } };
  sheet.mergeCells(`A${disclaimerRow.number}:E${disclaimerRow.number}`);

  return workbook.xlsx.writeBuffer();
}
