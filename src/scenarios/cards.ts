import { SeededRNG } from '../util/rng.js';
import { runMonteCarlo, MonteCarloOptions, MonteCarloResult } from '../engine/monteCarlo.js';

export interface CardsParams {
  draw: number;
  condition: string;
  exact?: boolean;
}

interface ParsedCondition {
  type: 'aces' | 'hearts' | 'any_rank' | 'any_suit';
  operator: '>=';
  value: number | string;
}

/**
 * Standard 52-card deck
 */
const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'] as const;
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'] as const;

interface Card {
  suit: typeof SUITS[number];
  rank: typeof RANKS[number];
}

function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank });
    }
  }
  return deck;
}

/**
 * Parse cards condition string
 * Supported: aces>=k, hearts>=k, any_rank=K, any_suit=hearts
 */
function parseCondition(condition: string): ParsedCondition {
  const patterns = [
    { regex: /^aces>=(\d+)$/, type: 'aces' as const, operator: '>=' as const },
    { regex: /^hearts>=(\d+)$/, type: 'hearts' as const, operator: '>=' as const },
    { regex: /^any_rank=([A-K]|10|[2-9])$/, type: 'any_rank' as const, operator: '>=' as const },
    { regex: /^any_suit=(hearts|diamonds|clubs|spades)$/, type: 'any_suit' as const, operator: '>=' as const },
  ];

  for (const pattern of patterns) {
    const match = condition.match(pattern.regex);
    if (match) {
      const value = pattern.type === 'aces' || pattern.type === 'hearts'
        ? parseInt(match[1], 10)
        : match[1];
      return {
        type: pattern.type,
        operator: pattern.operator,
        value,
      };
    }
  }

  throw new Error(
    `Invalid cards condition: ${condition}. Supported: aces>=k, hearts>=k, any_rank=K, any_suit=hearts`
  );
}

/**
 * Check if drawn cards meet condition
 */
function checkCondition(cards: Card[], condition: ParsedCondition): boolean {
  switch (condition.type) {
    case 'aces':
      const aceCount = cards.filter(c => c.rank === 'A').length;
      return aceCount >= (condition.value as number);

    case 'hearts':
      const heartCount = cards.filter(c => c.suit === 'hearts').length;
      return heartCount >= (condition.value as number);

    case 'any_rank':
      return cards.some(c => c.rank === condition.value);

    case 'any_suit':
      return cards.some(c => c.suit === condition.value);
  }
}

/**
 * Calculate binomial coefficient C(n, k)
 */
function binomialCoefficient(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;

  // Use the smaller of k and n-k for efficiency
  k = Math.min(k, n - k);

  let result = 1;
  for (let i = 0; i < k; i++) {
    result *= (n - i);
    result /= (i + 1);
  }

  return result;
}

/**
 * Calculate exact probability using hypergeometric distribution
 * Only supported for aces>=k and hearts>=k
 */
function calculateExactProbability(params: CardsParams, condition: ParsedCondition): number {
  const N = 52; // Total cards
  const n = params.draw; // Cards drawn
  let K: number; // Success states in population

  if (condition.type === 'aces') {
    K = 4; // 4 aces in deck
  } else if (condition.type === 'hearts') {
    K = 13; // 13 hearts in deck
  } else {
    throw new Error(
      `Exact calculation only supported for aces>=k and hearts>=k conditions. Got: ${params.condition}`
    );
  }

  const k = condition.value as number; // Minimum successes needed

  // P(X >= k) = sum_{x=k..min(n,K)} C(K,x) * C(N-K,n-x) / C(N,n)
  const totalCombinations = binomialCoefficient(N, n);
  let successCombinations = 0;

  for (let x = k; x <= Math.min(n, K); x++) {
    const waysToChooseSuccess = binomialCoefficient(K, x);
    const waysToChooseFailure = binomialCoefficient(N - K, n - x);
    successCombinations += waysToChooseSuccess * waysToChooseFailure;
  }

  return successCombinations / totalCombinations;
}

/**
 * Run cards simulation or exact calculation
 */
export function runCardsSimulation(
  params: CardsParams,
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
    const deck = createDeck();
    rng.shuffle(deck);
    const drawnCards = deck.slice(0, params.draw);
    return checkCondition(drawnCards, parsedCondition);
  };

  const result = runMonteCarlo(trialFn, options);

  return {
    ...result,
    exact: false,
  };
}
