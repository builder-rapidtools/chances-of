import { describe, it, expect } from 'vitest';
import { runDiceSimulation } from '../src/scenarios/dice.js';
import { runCardsSimulation } from '../src/scenarios/cards.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

describe('Feature Tests', () => {
  describe('Precision-Stop Mode', () => {
    it('should stop when target CI width is reached', () => {
      const result = runDiceSimulation(
        { dice: 1, sides: 6, condition: 'sum>=6' },
        { seed: 42, targetCIWidth: 0.02, maxTrials: 500000, batchSize: 10000 }
      );

      const ciWidth = result.ci_high! - result.ci_low!;
      expect(ciWidth).toBeLessThanOrEqual(0.02);
      expect(result.trials).toBeLessThan(500000);
      expect(result.stop_reason).toBe('Target CI width reached');
    });

    it('should stop at max trials if target not reached', () => {
      const result = runDiceSimulation(
        { dice: 1, sides: 6, condition: 'sum>=6' },
        { seed: 42, targetCIWidth: 0.0001, maxTrials: 10000, batchSize: 1000 }
      );

      expect(result.trials).toBe(10000);
      expect(result.stop_reason).toBe('Max trials reached');
    });

    it('should prefer target-ci-width over fixed trials', () => {
      const result = runDiceSimulation(
        { dice: 1, sides: 6, condition: 'sum>=6' },
        { seed: 42, trials: 100000, targetCIWidth: 0.05, batchSize: 5000 }
      );

      // Should stop early due to CI width target
      expect(result.trials).toBeLessThan(100000);
      expect(result.stop_reason).toBe('Target CI width reached');
    });
  });

  describe('JSON Output', () => {
    it('should output valid JSON for dice command', async () => {
      const { stdout } = await execAsync(
        'node dist/cli.js dice --dice 2 --sides 6 --condition "sum>=10" --trials 10000 --seed 42 --json'
      );

      const result = JSON.parse(stdout);

      expect(result).toHaveProperty('scenario', 'dice');
      expect(result).toHaveProperty('params');
      expect(result).toHaveProperty('trials');
      expect(result).toHaveProperty('successes');
      expect(result).toHaveProperty('probability');
      expect(result).toHaveProperty('ci_low');
      expect(result).toHaveProperty('ci_high');
      expect(result).toHaveProperty('exact');
      expect(result).toHaveProperty('time_ms');
      expect(result).toHaveProperty('stop_reason');

      expect(typeof result.scenario).toBe('string');
      expect(typeof result.params).toBe('object');
      expect(typeof result.trials).toBe('number');
      expect(typeof result.successes).toBe('number');
      expect(typeof result.probability).toBe('number');
      expect(typeof result.exact).toBe('boolean');
      expect(typeof result.time_ms).toBe('number');
    });

    it('should output JSON with null values for exact mode', async () => {
      const { stdout } = await execAsync(
        'node dist/cli.js cards --draw 2 --condition "aces>=2" --exact --json'
      );

      const result = JSON.parse(stdout);

      expect(result.exact).toBe(true);
      expect(result.ci_low).toBeNull();
      expect(result.ci_high).toBeNull();
      expect(result.successes).toBeNull();
      expect(result.trials).toBe(0);
    });

    it('should output JSON for binomial command', async () => {
      const { stdout } = await execAsync(
        'node dist/cli.js binomial --n 20 --p 0.1 --condition "successes>=3" --exact --json'
      );

      const result = JSON.parse(stdout);

      expect(result.scenario).toBe('binomial');
      expect(result.exact).toBe(true);
      expect(result.probability).toBeGreaterThan(0);
      expect(result.probability).toBeLessThan(1);
    });
  });

  describe('Determinism', () => {
    it('should produce identical results with same seed', () => {
      const result1 = runDiceSimulation(
        { dice: 2, sides: 6, condition: 'sum>=10' },
        { seed: 42, trials: 50000 }
      );

      const result2 = runDiceSimulation(
        { dice: 2, sides: 6, condition: 'sum>=10' },
        { seed: 42, trials: 50000 }
      );

      expect(result1.probability).toBe(result2.probability);
      expect(result1.successes).toBe(result2.successes);
    });

    it('should produce different results with different seeds', () => {
      const result1 = runDiceSimulation(
        { dice: 2, sides: 6, condition: 'sum>=10' },
        { seed: 42, trials: 50000 }
      );

      const result2 = runDiceSimulation(
        { dice: 2, sides: 6, condition: 'sum>=10' },
        { seed: 123, trials: 50000 }
      );

      // Very unlikely to be exactly the same
      expect(result1.probability).not.toBe(result2.probability);
    });
  });
});
