/**
 * Pearson product-moment correlation coefficient, r ∈ [-1, 1]. Standard
 * definition: covariance of x and y divided by the product of their
 * standard deviations. Used by the correlation matrix to answer genuine
 * questions like "does my trade duration actually predict my R-multiple?"
 * or "does my own 1-10 confidence rating predict real outcomes?" — this
 * is real statistics over the trader's own numeric fields, not a
 * categorical cross-tab relabeled as "correlation."
 */
export function calculatePearsonCorrelation(x: number[], y: number[]): number | null {
  const n = Math.min(x.length, y.length);
  if (n < 2) return null;

  const xs = x.slice(0, n);
  const ys = y.slice(0, n);
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = ys.reduce((a, b) => a + b, 0) / n;

  let covariance = 0;
  let varX = 0;
  let varY = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i]! - meanX;
    const dy = ys[i]! - meanY;
    covariance += dx * dy;
    varX += dx * dx;
    varY += dy * dy;
  }

  const denominator = Math.sqrt(varX * varY);
  if (denominator === 0) return null; // zero variance in one dimension — correlation is undefined, not zero
  return covariance / denominator;
}

export interface CorrelationMatrixEntry {
  dimensionA: string;
  dimensionB: string;
  correlation: number | null;
  sampleSize: number;
}

/**
 * Builds the full pairwise correlation matrix across a named set of
 * numeric series (e.g. duration, rMultiple, rating, maeAmount, mfeAmount,
 * quantity). The diagonal (a dimension against itself) is always
 * excluded by the caller — this returns every off-diagonal pair once.
 */
export function calculateCorrelationMatrix(dimensions: Record<string, number[]>): CorrelationMatrixEntry[] {
  const names = Object.keys(dimensions);
  const entries: CorrelationMatrixEntry[] = [];

  for (let i = 0; i < names.length; i++) {
    for (let j = i + 1; j < names.length; j++) {
      const a = names[i]!;
      const b = names[j]!;
      entries.push({
        dimensionA: a,
        dimensionB: b,
        correlation: calculatePearsonCorrelation(dimensions[a]!, dimensions[b]!),
        sampleSize: Math.min(dimensions[a]!.length, dimensions[b]!.length),
      });
    }
  }

  return entries;
}
