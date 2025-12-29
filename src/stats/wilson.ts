/**
 * Calculate Wilson score confidence interval for a proportion
 * This is more accurate than the normal approximation, especially for small sample sizes
 * or probabilities near 0 or 1.
 *
 * @param successes - Number of successes
 * @param trials - Total number of trials
 * @param confidence - Confidence level (default 0.95 for 95% CI)
 * @returns Object with ci_low and ci_high, clamped to [0, 1]
 */
export function wilsonCI(
  successes: number,
  trials: number,
  confidence: number = 0.95
): { ci_low: number; ci_high: number } {
  if (trials === 0) {
    return { ci_low: 0, ci_high: 1 };
  }

  const p = successes / trials;
  const n = trials;

  // Z-score for the given confidence level (1.96 for 95% CI)
  const z = getZScore(confidence);
  const z2 = z * z;

  const denominator = 1 + z2 / n;
  const center = (p + z2 / (2 * n)) / denominator;
  const margin = (z * Math.sqrt(p * (1 - p) / n + z2 / (4 * n * n))) / denominator;

  const ci_low = Math.max(0, center - margin);
  const ci_high = Math.min(1, center + margin);

  return { ci_low, ci_high };
}

/**
 * Get Z-score for common confidence levels
 */
function getZScore(confidence: number): number {
  // Common confidence levels
  if (confidence === 0.95) return 1.959964; // More precise than 1.96
  if (confidence === 0.99) return 2.576;
  if (confidence === 0.90) return 1.645;

  // For other confidence levels, use approximation
  // This is a simple lookup - for production, use inverse normal CDF
  throw new Error(`Unsupported confidence level: ${confidence}`);
}
