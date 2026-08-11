export interface PositionSizeInput {
  accountBalance: number;
  riskPercentage: number; // e.g. 1 for 1%
  entryPrice: number;
  stopLossPrice: number;
  contractMultiplier?: number; // currency value of one full unit of size moving 1.0 price unit
  maxPositionSize?: number;
}

export interface PositionSizeResult {
  riskAmount: number;
  positionSize: number;
  cappedByMaxSize: boolean;
  riskPerUnit: number;
}

export interface RiskOfRuinInput {
  winRate: number; // 0..1
  avgWinR: number;
  avgLossR: number; // positive number representing the average loss in R
  riskPerTradePercentage: number; // 0..100, fraction of equity risked per trade
  numTrades: number;
  simulations?: number;
}

export interface MarginInput {
  positionSize: number; // units of the instrument (e.g. 100,000 for 1 standard forex lot)
  price: number;
  leverage: number; // e.g. 30 for 30:1
  contractMultiplier?: number;
}

export interface MarginResult {
  notionalValue: number;
  marginRequired: number;
  effectiveLeverage: number;
}

export interface LotSizeInput {
  accountBalance: number;
  riskPercentage: number;
  stopLossPips: number;
  pipValuePerStandardLot: number; // currency value of 1 pip for 1.0 standard lot in the account's currency (broker-quoted)
}

export interface LotSizeResult {
  riskAmount: number;
  lotSize: number; // in standard lots (1.0 = 100,000 units)
  pipValueAtSize: number;
}

/**
 * Domain service for pre-trade risk sizing and statistical risk-of-ruin
 * estimation. Pure, side-effect-free — the same calculator backs the
 * Risk Management Center's position size calculator and the Analytics
 * module's risk-of-ruin chart.
 */
export class RiskEngine {
  calculatePositionSize(input: PositionSizeInput): PositionSizeResult {
    const riskAmount = input.accountBalance * (input.riskPercentage / 100);
    const riskPerUnit = Math.abs(input.entryPrice - input.stopLossPrice) * (input.contractMultiplier ?? 1);

    if (riskPerUnit <= 0) {
      return { riskAmount, positionSize: 0, cappedByMaxSize: false, riskPerUnit: 0 };
    }

    let positionSize = riskAmount / riskPerUnit;
    let cappedByMaxSize = false;
    if (input.maxPositionSize != null && positionSize > input.maxPositionSize) {
      positionSize = input.maxPositionSize;
      cappedByMaxSize = true;
    }
    return { riskAmount, positionSize, cappedByMaxSize, riskPerUnit };
  }

  /**
   * Estimates the probability of hitting a ruin threshold (e.g. account down
   * X%) via Monte Carlo simulation over sequences of Bernoulli trade outcomes
   * drawn from the trader's historical win rate and average win/loss R. This
   * is a parametric simulation (fixed win rate + fixed average R per class);
   * see @trading-os/analytics-engine's bootstrap simulation for a version
   * that resamples the trader's actual R-multiple distribution instead.
   */
  calculateRiskOfRuin(input: RiskOfRuinInput, ruinThresholdPercentage = 100): number {
    const simulations = input.simulations ?? 5000;
    let ruinCount = 0;

    for (let s = 0; s < simulations; s++) {
      let equity = 1;
      for (let t = 0; t < input.numTrades; t++) {
        const isWin = Math.random() < input.winRate;
        const rMultiple = isWin ? input.avgWinR : -input.avgLossR;
        equity += equity * (input.riskPerTradePercentage / 100) * rMultiple;

        if (equity <= 0 || equity <= 1 - ruinThresholdPercentage / 100) {
          ruinCount++;
          break;
        }
      }
    }
    return ruinCount / simulations;
  }

  /** Notional value, required margin, and the effective leverage actually being used at a given position size — the margin/leverage calculator. */
  calculateMargin(input: MarginInput): MarginResult {
    const notionalValue = input.positionSize * input.price * (input.contractMultiplier ?? 1);
    const marginRequired = input.leverage > 0 ? notionalValue / input.leverage : notionalValue;
    return { notionalValue, marginRequired, effectiveLeverage: input.leverage };
  }

  /**
   * Forex-convention lot size calculator: sizes a position in standard
   * lots (1.0 = 100,000 units) from a pip-denominated stop, using the
   * broker-quoted pip value per standard lot rather than raw price deltas
   * — the way most forex traders actually think about risk, and the
   * standard "lot size calculator" every prop-firm trader expects.
   */
  calculateLotSize(input: LotSizeInput): LotSizeResult {
    const riskAmount = input.accountBalance * (input.riskPercentage / 100);
    if (input.stopLossPips <= 0 || input.pipValuePerStandardLot <= 0) {
      return { riskAmount, lotSize: 0, pipValueAtSize: 0 };
    }
    const lotSize = riskAmount / (input.stopLossPips * input.pipValuePerStandardLot);
    return { riskAmount, lotSize, pipValueAtSize: lotSize * input.pipValuePerStandardLot };
  }
}
