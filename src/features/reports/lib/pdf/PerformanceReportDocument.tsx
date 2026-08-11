import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { PerformanceReportData } from "../reportData";

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 10, color: "#0f1420" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 2 },
  subtitle: { fontSize: 10, color: "#5e6d8f", marginBottom: 20 },
  sectionTitle: { fontSize: 13, fontWeight: "bold", marginTop: 18, marginBottom: 8, borderBottom: "1pt solid #d5dae6", paddingBottom: 4 },
  kpiGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  kpiCard: { width: 130, padding: 10, border: "1pt solid #d5dae6", borderRadius: 4, marginBottom: 10 },
  kpiLabel: { fontSize: 8, color: "#8794b0", textTransform: "uppercase", marginBottom: 4 },
  kpiValue: { fontSize: 14, fontWeight: "bold" },
  tableRow: { flexDirection: "row", borderBottom: "0.5pt solid #e9ecf3", paddingVertical: 5 },
  tableHeaderRow: { flexDirection: "row", borderBottom: "1pt solid #0f1420", paddingVertical: 5, fontWeight: "bold" },
  col: { flex: 1 },
  colWide: { flex: 2 },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, fontSize: 8, color: "#8794b0", textAlign: "center" },
});

function formatCurrency(v: number): string {
  const sign = v < 0 ? "-" : "";
  return `${sign}$${Math.abs(v).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.kpiCard}>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={styles.kpiValue}>{value}</Text>
    </View>
  );
}

export function PerformanceReportDocument({ data }: { data: PerformanceReportData }) {
  const { account, metrics, streaks, byStrategy, byInstrument, currentBalance, netPnL, maxDrawdownPct, generatedAt } = data;

  return (
    <Document title={`${account.name} — Performance Report`}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Performance Report</Text>
        <Text style={styles.subtitle}>
          {account.name} · Generated {new Date(generatedAt).toLocaleDateString()}
        </Text>

        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.kpiGrid}>
          <KpiCard label="Current Balance" value={formatCurrency(currentBalance)} />
          <KpiCard label="Net P&L" value={formatCurrency(netPnL)} />
          <KpiCard label="Win Rate" value={`${(metrics.winRate * 100).toFixed(0)}%`} />
          <KpiCard
            label="Profit Factor"
            value={metrics.profitFactor == null ? "—" : metrics.profitFactor === Infinity ? "∞" : metrics.profitFactor.toFixed(2)}
          />
          <KpiCard label="Expectancy" value={metrics.expectancy == null ? "—" : formatCurrency(metrics.expectancy)} />
          <KpiCard label="Avg R-Multiple" value={metrics.averageRMultiple == null ? "—" : `${metrics.averageRMultiple.toFixed(2)}R`} />
          <KpiCard label="Max Drawdown" value={`${maxDrawdownPct.toFixed(1)}%`} />
          <KpiCard label="Total Trades" value={String(metrics.totalTrades)} />
        </View>

        <Text style={styles.sectionTitle}>Performance by Strategy</Text>
        <View style={styles.tableHeaderRow}>
          <Text style={styles.colWide}>Strategy</Text>
          <Text style={styles.col}>Trades</Text>
          <Text style={styles.col}>Win Rate</Text>
          <Text style={styles.col}>Net P&L</Text>
        </View>
        {byStrategy.map((row) => (
          <View key={row.key} style={styles.tableRow}>
            <Text style={styles.colWide}>{row.key}</Text>
            <Text style={styles.col}>{row.tradeCount}</Text>
            <Text style={styles.col}>{(row.metrics.winRate * 100).toFixed(0)}%</Text>
            <Text style={styles.col}>{formatCurrency(row.metrics.netPnL)}</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Performance by Instrument</Text>
        <View style={styles.tableHeaderRow}>
          <Text style={styles.colWide}>Instrument</Text>
          <Text style={styles.col}>Trades</Text>
          <Text style={styles.col}>Win Rate</Text>
          <Text style={styles.col}>Net P&L</Text>
        </View>
        {byInstrument.map((row) => (
          <View key={row.key} style={styles.tableRow}>
            <Text style={styles.colWide}>{row.key}</Text>
            <Text style={styles.col}>{row.tradeCount}</Text>
            <Text style={styles.col}>{(row.metrics.winRate * 100).toFixed(0)}%</Text>
            <Text style={styles.col}>{formatCurrency(row.metrics.netPnL)}</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Streaks</Text>
        <View style={styles.tableRow}>
          <Text style={styles.colWide}>Longest winning streak</Text>
          <Text style={styles.col}>{streaks.longestWinStreak} trades</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.colWide}>Longest losing streak</Text>
          <Text style={styles.col}>{streaks.longestLossStreak} trades</Text>
        </View>

        <Text style={styles.footer} fixed>
          TradeOS · Generated {new Date(generatedAt).toLocaleString()} · Confidential
        </Text>
      </Page>
    </Document>
  );
}
