import { renderToBuffer } from "@react-pdf/renderer";
import { getPerformanceReportData } from "@/features/reports/lib/reportData";
import { PerformanceReportDocument } from "@/features/reports/lib/pdf/PerformanceReportDocument";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const accountId = searchParams.get("accountId");
  if (!accountId) return new Response("accountId is required", { status: 400 });

  const data = await getPerformanceReportData(accountId);
  const buffer = await renderToBuffer(<PerformanceReportDocument data={data} />);

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="performance-report-${accountId}.pdf"`,
    },
  });
}
