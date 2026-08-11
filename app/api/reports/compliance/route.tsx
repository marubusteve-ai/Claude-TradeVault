import { renderToBuffer } from "@react-pdf/renderer";
import { getComplianceReportData } from "@/features/reports/lib/reportData";
import { ComplianceReportDocument } from "@/features/reports/lib/pdf/ComplianceReportDocument";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const accountId = searchParams.get("accountId");
  if (!accountId) return new Response("accountId is required", { status: 400 });

  const data = await getComplianceReportData(accountId);
  const buffer = await renderToBuffer(<ComplianceReportDocument data={data} />);

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="compliance-report-${accountId}.pdf"`,
    },
  });
}
