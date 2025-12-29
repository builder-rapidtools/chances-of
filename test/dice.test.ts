import { describe, it, expect } from 'vitest';
import { runDiceSimulation } from '../src/scenarios/dice.js';

describe('Dice Simulation', () => {
  it('should calculate probability of 2d6 sum>=10 within tolerance (acceptance test)', () => {
    const result = runDiceSimulation(
      { dice: 2, sides: 6, condition: 'sum>=10' },
      { seed: 42, trials: 200000 }
    );

    // Theoretical probability: 6/36 = 0.1667
    expect(result.probability).toBeCloseTo(0.1667, 2);
  });

  it('should support sum==X condition', () => {
    const result = runDiceSimulation(
      { dice: 2, sides: 6, condition: 'sum==7' },
      { seed: 42, trials: 100000 }
    );

    // Theoretical probability: 6/36 = 0.1667
    expect(result.probability).toBeGreaterThan(0.15);
    expect(result.probability).toBeLessThan(0.18);
  });

  it('should support max>=X condition', () => {
    const result = runDiceSimulation(
      { dice: 2, sides: 6, condition: 'max>=5' },
      { seed: 42, trials: 100000 }
    );

    // Should be > 0.5 (at least one die >= 5)
    expect(result.probability).toBeGreaterThan(0.5);
  });

  it('should support min>=X condition', () => {
    const result = runDiceSimulation(
      { dice: 2, sides: 6, condition: 'min>=5' },
      { seed: 42, trials: 100000 }
    );

    // Theoretical: (2/6)^2 = 4/36 = 0.1111
    expect(result.probability).toBeCloseTo(0.1111, 2);
  });

  it('should throw error for invalid condition', () => {
    expect(() =>
      runDiceSimulation(
        { dice: 2, sides: 6, condition: 'invalid' },
        { seed: 42, trials: 1000 }
      )
    ).toThrow();
  });

  it('should return confidence intervals', () => {
    const result = runDiceSimulation(
      { dice: 2, sides: 6, condition: 'sum>=10' },
      { seed: 42, trials: 10000 }
    );

    expect(result.ci_low).not.toBeNull();
    expect(result.ci_high).not.toBeNull();
    expect(result.ci_low!).toBeLessThanOrEqual(result.probability);
    expect(result.ci_high!).toBeGreaterThanOrEqual(result.probability);
  });
});
