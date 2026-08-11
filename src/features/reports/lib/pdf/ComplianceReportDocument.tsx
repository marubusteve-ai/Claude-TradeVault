import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { ComplianceReportData } from "../reportData";

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 10, color: "#0f1420" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 2 },
  subtitle: { fontSize: 10, color: "#5e6d8f", marginBottom: 4 },
  statusBadge: { fontSize: 11, fontWeight: "bold", marginTop: 10, marginBottom: 16 },
  checkBlock: { marginBottom: 14, paddingBottom: 12, borderBottom: "0.5pt solid #e9ecf3" },
  checkHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  checkLabel: { fontSize: 11, fontWeight: "bold" },
  checkStatus: { fontSize: 10, fontWeight: "bold" },
  checkDetail: { fontSize: 9, color: "#5e6d8f" },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, fontSize: 8, color: "#8794b0", textAlign: "center" },
});

const STATUS_COLOR: Record<string, string> = { pass: "#0e9f6e", warning: "#c2540c", breach: "#c2373f", not_applicable: "#8794b0" };
const OVERALL_COLOR: Record<string, string> = { compliant: "#0e9f6e", warning: "#c2540c", breached: "#c2373f" };

export function ComplianceReportDocument({ data }: { data: ComplianceReportData }) {
  const { account, report, ruleSetName, generatedAt } = data;

  return (
    <Document title={`${account.name} — Compliance Report`}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Prop Firm Compliance Report</Text>
        <Text style={styles.subtitle}>
          {account.name} · {ruleSetName}
        </Text>
        <Text style={styles.subtitle}>Generated {new Date(generatedAt).toLocaleDateString()}</Text>

        <Text style={[styles.statusBadge, { color: OVERALL_COLOR[report.overallStatus] }]}>
          Overall Status: {report.overallStatus.toUpperCase()}
        </Text>

        {report.checks.map((check) => (
          <View key={check.ruleId} style={styles.checkBlock}>
            <View style={styles.checkHeader}>
              <Text style={styles.checkLabel}>{check.label}</Text>
              <Text style={[styles.checkStatus, { color: STATUS_COLOR[check.status] }]}>
                {check.status.replace("_", " ").toUpperCase()}
              </Text>
            </View>
            <Text style={styles.checkDetail}>{check.detail}</Text>
          </View>
        ))}

        <Text style={styles.footer} fixed>
          TradeOS · Generated {new Date(generatedAt).toLocaleString()} · Confidential — not an official statement from the prop firm
        </Text>
      </Page>
    </Document>
  );
}
