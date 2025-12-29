import { SeededRNG } from '../util/rng.js';
import { runMonteCarlo, MonteCarloOptions, MonteCarloResult } from '../engine/monteCarlo.js';

export interface BinomialParams {
  n: number;
  p: number;
  condition: string;
  exact?: boolean;
}

interface ParsedCondition {
  operator: '>=' | '==';
  value: number;
}

/**
 * Parse binomial condition string
 * Supported: successes>=X, successes==X
 */
function parseCondition(condition: string): ParsedCondition {
  const patterns = [
    { regex: /^successes>=(\d+)$/, operator: '>=' as const },
    { regex: /^successes==(\d+)$/, operator: '==' as const },
  ];

  for (const pattern of patterns) {
    const match = condition.match(pattern.regex);
    if (match) {
      return {
        operator: pattern.operator,
        value: parseInt(match[1], 10),
      };
    }
  }

  throw new Error(
    `Invalid binomial condition: ${condition}. Supported: successes>=X, successes==X`
  );
}

/**
 * Calculate binomial coefficient C(n, k)
 */
function binomialCoefficient(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;

  k = Math.min(k, n - k);

  let result = 1;
  for (let i = 0; i < k; i++) {
    result *= (n - i);
    result /= (i + 1);
  }

  return result;
}

/**
 * Calculate exact binomial probability P(X = k)
 */
function binomialPMF(n: number, k: number, p: number): number {
  return binomialCoefficient(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
}

/**
 * Calculate exact probability for binomial distribution
 */
function calculateExactProbability(params: BinomialParams, condition: ParsedCondition): number {
  const { n, p } = params;
  const { operator, value } = condition;

  if (operator === '==') {
    return binomialPMF(n, value, p);
  } else {
    // operator === '>='
    let probability = 0;
    for (let k = value; k <= n; k++) {
      probability += binomialPMF(n, k, p);
    }
    return probability;
  }
}

/**
 * Run binomial simulation or exact calculation
 */
export function runBinomialSimulation(
  params: BinomialParams,
  options: MonteCarloOptions
): MonteCarloResult & { exact: boolean } {
  const parsedCondition = parseCondition(params.condition);

  // Check if exact mode is requested
  if (params.exact) {
    const startTime = Date.now();
    const probability = calculateExactProbability(params, parsedCondition);
    const time_ms = Date.now() - startTime;

    return {
      trials: 0,
      successes: 0,
      probability,
      ci_low: null,
      ci_high: null,
      stop_reason: null,
      exact: true,
    };
  }

  // Monte Carlo simulation
  const trialFn = (rng: SeededRNG): boolean => {
    let successes = 0;
    for (let i = 0; i < params.n; i++) {
      if (rng.next() < params.p) {
        successes++;
      }
    }

    if (parsedCondition.operator === '==') {
      return successes === parsedCondition.value;
    } else {
      return successes >= parsedCondition.value;
    }
  };

  const result = runMonteCarlo(trialFn, options);

  return {
    ...result,
    exact: false,
  };
}
