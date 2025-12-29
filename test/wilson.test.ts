import { describe, it, expect } from 'vitest';
import { wilsonCI } from '../src/stats/wilson.js';

describe('Wilson Score Confidence Interval', () => {
  it('should return [0, 1] for zero trials', () => {
    const result = wilsonCI(0, 0);
    expect(result.ci_low).toBe(0);
    expect(result.ci_high).toBe(1);
  });

  it('should clamp values to [0, 1]', () => {
    const result = wilsonCI(100, 100);
    expect(result.ci_low).toBeGreaterThanOrEqual(0);
    expect(result.ci_high).toBeLessThanOrEqual(1);
  });

  it('should produce narrower intervals with more trials', () => {
    const small = wilsonCI(50, 100);
    const large = wilsonCI(5000, 10000);

    const smallWidth = small.ci_high - small.ci_low;
    const largeWidth = large.ci_high - large.ci_low;

    expect(largeWidth).toBeLessThan(smallWidth);
  });

  it('should have ci_low <= ci_high', () => {
    const result = wilsonCI(30, 100);
    expect(result.ci_low).toBeLessThanOrEqual(result.ci_high);
  });
});
