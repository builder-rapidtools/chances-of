import { describe, it, expect } from 'vitest';
import { runBinomialSimulation } from '../src/scenarios/binomial.js';

describe('Binomial Simulation', () => {
  it('should calculate exact binomial for n=20 p=0.1 successes>=3 (acceptance test)', () => {
    const result = runBinomialSimulation(
      { n: 20, p: 0.1, condition: 'successes>=3', exact: true },
      { seed: 42 }
    );

    // Calculate exact value
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

    let expected = 0;
    for (let k = 3; k <= 20; k++) {
      expected += C(20, k) * Math.pow(0.1, k) * Math.pow(0.9, 20 - k);
    }

    expect(Math.abs(result.probability - expected)).toBeLessThan(1e-10);
    expect(result.exact).toBe(true);
    expect(result.ci_low).toBeNull();
    expect(result.ci_high).toBeNull();
  });

  it('should support successes==X condition', () => {
    const result = runBinomialSimulation(
      { n: 10, p: 0.5, condition: 'successes==5', exact: true },
      { seed: 42 }
    );

    // C(10,5) * 0.5^10 = 252/1024
    const expected = 252 / 1024;
    expect(Math.abs(result.probability - expected)).toBeLessThan(1e-10);
  });

  it('should run Monte Carlo simulation when exact=false', () => {
    const result = runBinomialSimulation(
      { n: 20, p: 0.1, condition: 'successes>=3', exact: false },
      { seed: 42, trials: 100000 }
    );

    expect(result.exact).toBe(false);
    expect(result.trials).toBe(100000);
    expect(result.successes).toBeGreaterThan(0);
    expect(result.ci_low).not.toBeNull();
    expect(result.ci_high).not.toBeNull();
  });

  it('should match Monte Carlo with exact within statistical bounds', () => {
    const exactResult = runBinomialSimulation(
      { n: 20, p: 0.1, condition: 'successes>=3', exact: true },
      { seed: 42 }
    );

    const mcResult = runBinomialSimulation(
      { n: 20, p: 0.1, condition: 'successes>=3', exact: false },
      { seed: 42, trials: 200000 }
    );

    const p = exactResult.probability;
    const n = mcResult.trials;
    const standardError = Math.sqrt((p * (1 - p)) / n);

    // Check if within 4 standard errors
    expect(Math.abs(mcResult.probability - p)).toBeLessThan(4 * standardError);
  });

  it('should throw error for invalid condition', () => {
    expect(() =>
      runBinomialSimulation(
        { n: 10, p: 0.5, condition: 'invalid' },
        { seed: 42, trials: 1000 }
      )
    ).toThrow();
  });
});
