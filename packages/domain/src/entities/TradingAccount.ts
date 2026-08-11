import { Money, type CurrencyCode } from "../value-objects/Money";
import type { Trade } from "./Trade";
import type { TradingAccountRecord } from "@trading-os/shared-types";

export interface EquityPoint {
  date: string;
  balance: number;
  equity: number;
}

export class TradingAccount {
  private constructor(private readonly data: TradingAccountRecord) {}

  static fromRecord(data: TradingAccountRecord): TradingAccount {
    return new TradingAccount(data);
  }

  get id(): string {
    return this.data.id;
  }
  get name(): string {
    return this.data.name;
  }
  get currency(): CurrencyCode {
    return this.data.currency ?? "USD";
  }
  get startingBalance(): Money {
    return Money.fromMajor(this.data.startingBalance, this.currency);
  }

  /** Builds a chronological equity curve from closed trades, walking forward from the starting balance. Powers every equity-curve chart in the product. */
  buildEquityCurve(trades: Trade[]): EquityPoint[] {
    const closed = trades
      .filter((t) => t.status === "closed" && t.netPnL != null && t.exitTime != null)
      .sort((a, b) => new Date(a.exitTime!).getTime() - new Date(b.exitTime!).getTime());

    let running = this.startingBalance;
    const points: EquityPoint[] = [{ date: this.data.createdAt, balance: running.toMajor(), equity: running.toMajor() }];

    for (const trade of closed) {
      running = running.add(trade.netPnL!);
      points.push({ date: trade.exitTime!, balance: running.toMajor(), equity: running.toMajor() });
    }
    return points;
  }

  currentBalance(trades: Trade[]): Money {
    const curve = this.buildEquityCurve(trades);
    return Money.fromMajor(curve[curve.length - 1]!.equity, this.currency);
  }

  netPnL(trades: Trade[]): Money {
    return this.currentBalance(trades).subtract(this.startingBalance);
  }

  /** Peak-to-current drawdown, in both currency and percentage terms — what a trailing-drawdown prop-firm rule tracks in real time. */
  currentDrawdown(trades: Trade[]): { amount: Money; percentage: number } {
    const curve = this.buildEquityCurve(trades);
    let peak = curve[0]!.equity;
    for (const point of curve) peak = Math.max(peak, point.equity);
    const current = curve[curve.length - 1]!.equity;
    const drawdownAmount = Math.max(0, peak - current);
    return {
      amount: Money.fromMajor(drawdownAmount, this.currency),
      percentage: peak > 0 ? (drawdownAmount / peak) * 100 : 0,
    };
  }

  /** Largest peak-to-trough decline across the account's entire history. */
  maxDrawdown(trades: Trade[]): { amount: Money; percentage: number } {
    const curve = this.buildEquityCurve(trades);
    let peak = curve[0]!.equity;
    let maxDD = 0;
    let maxDDPct = 0;
    for (const point of curve) {
      peak = Math.max(peak, point.equity);
      const dd = peak - point.equity;
      const ddPct = peak > 0 ? (dd / peak) * 100 : 0;
      if (dd > maxDD) maxDD = dd;
      if (ddPct > maxDDPct) maxDDPct = ddPct;
    }
    return { amount: Money.fromMajor(maxDD, this.currency), percentage: maxDDPct };
  }

  toRecord(): TradingAccountRecord {
    return this.data;
  }
}
