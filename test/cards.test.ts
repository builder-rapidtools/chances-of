import { describe, it, expect } from 'vitest';
import { runCardsSimulation } from '../src/scenarios/cards.js';

describe('Cards Simulation', () => {
  it('should calculate probability of draw=2 aces>=2 within tolerance (acceptance test)', () => {
    const result = runCardsSimulation(
      { draw: 2, condition: 'aces>=2' },
      { seed: 42, trials: 200000 }
    );

    // Theoretical: C(4,2)/C(52,2) = 6/1326 ≈ 0.004524
    expect(Math.abs(result.probability - 0.004524)).toBeLessThan(0.002);
  });

  it('should calculate exact hypergeometric for aces>=2 (exact test)', () => {
    const result = runCardsSimulation(
      { draw: 2, condition: 'aces>=2', exact: true },
      { seed: 42 }
    );

    // C(4,2) / C(52,2) = 6 / 1326 = 0.00452488...
    const expected = 6 / 1326;
    expect(Math.abs(result.probability - expected)).toBeLessThan(1e-12);
    expect(result.exact).toBe(true);
    expect(result.ci_low).toBeNull();
    expect(result.ci_high).toBeNull();
  });

  it('should calculate exact hypergeometric for hearts>=3 (exact test)', () => {
    const result = runCardsSimulation(
      { draw: 5, condition: 'hearts>=3', exact: true },
      { seed: 42 }
    );

    // Manual calculation of hypergeometric sum
    // P(X >= 3) = P(X=3) + P(X=4) + P(X=5)
    // Using hypergeometric distribution
    const C = (n: number, k: number): number => {
      if (k < 0 || k > n) return 0;
      if (k === 0 || k === n) return 1;
      k = Math.min(k, n - k);
      let result = 1;
      for (let i = 0; i < k; i++) {
        result *= (n - i);
        result /= (i + 1);
      }
      return result;
    };

    const N = 52, K = 13, n = 5;
    let expected = 0;
    for (let x = 3; x <= 5; x++) {
      expected += (C(K, x) * C(N - K, n - x)) / C(N, n);
    }

    expect(Math.abs(result.probability - expected)).toBeLessThan(1e-12);
    expect(result.exact).toBe(true);
  });

  it('should match Monte Carlo with exact within statistical bounds', () => {
    const exactResult = runCardsSimulation(
      { draw: 2, condition: 'aces>=2', exact: true },
      { seed: 42 }
    );

    const mcResult = runCardsSimulation(
      { draw: 2, condition: 'aces>=2', exact: false },
      { seed: 42, trials: 300000 }
    );

    const p = exactResult.probability;
    const n = mcResult.trials;
    const standardError = Math.sqrt((p * (1 - p)) / n);

    // Check if within 4 standard errors
    expect(Math.abs(mcResult.probability - p)).toBeLessThan(4 * standardError);
  });

  it('should throw error when exact mode used with unsupported condition', () => {
    expect(() =>
      runCardsSimulation(
        { draw: 2, condition: 'any_rank=A', exact: true },
        { seed: 42 }
      )
    ).toThrow(/Exact calculation only supported/);
  });

  it('should support hearts>=k condition', () => {
    const result = runCardsSimulation(
      { draw: 5, condition: 'hearts>=2' },
      { seed: 42, trials: 100000 }
    );

    expect(result.probability).toBeGreaterThan(0);
    expect(result.probability).toBeLessThan(1);
  });

  it('should support any_rank condition', () => {
    const result = runCardsSimulation(
      { draw: 5, condition: 'any_rank=K' },
      { seed: 42, trials: 100000 }
    );

    expect(result.probability).toBeGreaterThan(0);
    expect(result.probability).toBeLessThan(1);
  });

  it('should support any_suit condition', () => {
    const result = runCardsSimulation(
      { draw: 5, condition: 'any_suit=hearts' },
      { seed: 42, trials: 100000 }
    );

    expect(result.probability).toBeGreaterThan(0);
    expect(result.probability).toBeLessThan(1);
  });

  it('should draw without replacement', () => {
    // Test that we can't draw more aces than exist
    const result = runCardsSimulation(
      { draw: 52, condition: 'aces>=5' },
      { seed: 42, trials: 10000 }
    );

    // Impossible to draw 5 aces from a deck with only 4
    expect(result.probability).toBe(0);
  });
});
