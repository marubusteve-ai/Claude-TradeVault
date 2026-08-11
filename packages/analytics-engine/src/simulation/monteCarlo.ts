export interface MonteCarloInput {
  /** The trader's own historical R-multiples — the distribution simulated trades are bootstrapped (resampled) from. */
  historicalRMultiples: number[];
  numTradesToProject: number;
  numSimulations?: number;
  startingEquity?: number;
  riskPerTradePercentage: number; // fraction of current equity risked per trade, e.g. 1 for 1%
}

export interface MonteCarloResult {
  /** A capped sample of raw simulated paths, sized for charting rather than full statistical output. */
  paths: number[][];
  percentile5: number[];
  percentile50: number[];
  percentile95: number[];
  probabilityOfProfit: number;
  probabilityOfRuin: number;
  finalEquityDistribution: { min: number; p25: number; median: number; p75: number; max: number };
}

function percentileOf(sorted: number[], p: number): number {
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.floor((p / 100) * sorted.length)));
  return sorted[idx]!;
}

/**
 * Bootstrap Monte Carlo: resamples the trader's own historical R-multiple
 * distribution (with replacement) to project a distribution of future
 * equity paths. Unlike a parametric simulation that assumes a fixed win
 * rate and average win/loss, this preserves the actual shape of the
 * trader's edge — fat tails, skew, and all — which is what "given how I
 * actually trade, what's a realistic range of outcomes over the next N
 * trades?" requires.
 */
export function runMonteCarloSimulation(input: MonteCarloInput): MonteCarloResult {
  if (input.historicalRMultiples.length === 0) {
    throw new Error("Monte Carlo simulation requires at least one historical R-multiple sample");
  }

  const simulations = input.numSimulations ?? 1000;
  const startingEquity = input.startingEquity ?? 10000;
  const sample = input.historicalRMultiples;

  const allPaths: number[][] = [];
  const finalEquities: number[] = [];

  for (let s = 0; s < simulations; s++) {
    const path: number[] = [startingEquity];
    let equity = startingEquity;
    for (let t = 0; t < input.numTradesToProject; t++) {
      const r = sample[Math.floor(Math.random() * sample.length)]!;
      equity = Math.max(0, equity + equity * (input.riskPerTradePercentage / 100) * r);
      path.push(equity);
    }
    allPaths.push(path);
    finalEquities.push(equity);
  }

  const stepCount = input.numTradesToProject + 1;
  const percentile5: number[] = [];
  const percentile50: number[] = [];
  const percentile95: number[] = [];

  for (let step = 0; step < stepCount; step++) {
    const valuesAtStep = allPaths.map((p) => p[step]!).sort((a, b) => a - b);
    percentile5.push(percentileOf(valuesAtStep, 5));
    percentile50.push(percentileOf(valuesAtStep, 50));
    percentile95.push(percentileOf(valuesAtStep, 95));
  }

  const sortedFinals = [...finalEquities].sort((a, b) => a - b);

  return {
    paths: allPaths.slice(0, 50), // cap raw paths returned — the percentile bands are what most charts actually render
    percentile5,
    percentile50,
    percentile95,
    probabilityOfProfit: finalEquities.filter((e) => e > startingEquity).length / simulations,
    probabilityOfRuin: finalEquities.filter((e) => e <= 0).length / simulations,
    finalEquityDistribution: {
      min: sortedFinals[0]!,
      p25: percentileOf(sortedFinals, 25),
      median: percentileOf(sortedFinals, 50),
      p75: percentileOf(sortedFinals, 75),
      max: sortedFinals[sortedFinals.length - 1]!,
    },
  };
}
