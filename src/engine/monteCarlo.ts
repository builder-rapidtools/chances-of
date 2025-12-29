import { SeededRNG } from '../util/rng.js';
import { wilsonCI } from '../stats/wilson.js';

export interface MonteCarloOptions {
  trials?: number;
  seed: number;
  targetCIWidth?: number;
  maxTrials?: number;
  batchSize?: number;
}

export interface MonteCarloResult {
  trials: number;
  successes: number;
  probability: number;
  ci_low: number | null;
  ci_high: number | null;
  stop_reason: string | null;
}

/**
 * Run Monte Carlo simulation with optional precision-stop mode
 */
export function runMonteCarlo(
  trialFn: (rng: SeededRNG) => boolean,
  options: MonteCarloOptions
): MonteCarloResult {
  const rng = new SeededRNG(options.seed);

  // Determine if we're using precision-stop mode
  const usePrecisionStop = options.targetCIWidth !== undefined;

  if (usePrecisionStop) {
    return runWithPrecisionStop(trialFn, rng, options);
  } else {
    return runFixedTrials(trialFn, rng, options.trials || 100000);
  }
}

/**
 * Run fixed number of trials
 */
function runFixedTrials(
  trialFn: (rng: SeededRNG) => boolean,
  rng: SeededRNG,
  trials: number
): MonteCarloResult {
  let successes = 0;

  for (let i = 0; i < trials; i++) {
    if (trialFn(rng)) {
      successes++;
    }
  }

  const probability = successes / trials;
  const { ci_low, ci_high } = wilsonCI(successes, trials);

  return {
    trials,
    successes,
    probability,
    ci_low,
    ci_high,
    stop_reason: null,
  };
}

/**
 * Run with precision-stop mode (adaptive sampling)
 */
function runWithPrecisionStop(
  trialFn: (rng: SeededRNG) => boolean,
  rng: SeededRNG,
  options: MonteCarloOptions
): MonteCarloResult {
  const targetCIWidth = options.targetCIWidth!;
  const maxTrials = options.maxTrials || 5000000;
  const batchSize = options.batchSize || 10000;

  let totalTrials = 0;
  let totalSuccesses = 0;
  let stop_reason: string | null = null;

  while (totalTrials < maxTrials) {
    // Run a batch
    const batchTrials = Math.min(batchSize, maxTrials - totalTrials);

    for (let i = 0; i < batchTrials; i++) {
      if (trialFn(rng)) {
        totalSuccesses++;
      }
    }

    totalTrials += batchTrials;

    // Check if we've reached target CI width
    const { ci_low, ci_high } = wilsonCI(totalSuccesses, totalTrials);
    const ciWidth = ci_high - ci_low;

    if (ciWidth <= targetCIWidth) {
      stop_reason = 'Target CI width reached';
      break;
    }
  }

  if (stop_reason === null) {
    stop_reason = 'Max trials reached';
  }

  const probability = totalSuccesses / totalTrials;
  const { ci_low, ci_high } = wilsonCI(totalSuccesses, totalTrials);

  return {
    trials: totalTrials,
    successes: totalSuccesses,
    probability,
    ci_low,
    ci_high,
    stop_reason,
  };
}
