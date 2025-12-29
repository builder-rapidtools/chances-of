import { describe, it, expect } from 'vitest';
import { parseNaturalLanguage } from '../ui/lib/nlParser.js';

describe('NL Parser - False Positives Prevention', () => {
  it('should reject unrelated real-world questions about food', () => {
    const result = parseNaturalLanguage(
      'What are the chances the sandwich I bought today goes off in 3 days?'
    );
    expect(result.scenario).toBeNull();
    expect(result.confidence).toBe('low');
  });

  it('should reject weather-related questions', () => {
    const result = parseNaturalLanguage(
      'What are the chances it rains tomorrow?'
    );
    expect(result.scenario).toBeNull();
    expect(result.confidence).toBe('low');
  });

  it('should reject battery-related questions even with "die" word', () => {
    const result = parseNaturalLanguage(
      'Will my battery die before I get home?'
    );
    expect(result.scenario).toBeNull();
    expect(result.confidence).toBe('low');
  });

  it('should reject generic number questions', () => {
    const result = parseNaturalLanguage(
      'What are the chances I finish this in 3 days?'
    );
    expect(result.scenario).toBeNull();
    expect(result.confidence).toBe('low');
  });

  it('should reject questions with numbers but no domain keywords', () => {
    const result = parseNaturalLanguage(
      'How likely is it that 5 people show up?'
    );
    expect(result.scenario).toBeNull();
    expect(result.confidence).toBe('low');
  });
});

describe('NL Parser - Valid Inputs', () => {
  it('should parse valid dice queries with explicit dice notation', () => {
    const result = parseNaturalLanguage('roll 2d6, sum at least 7');
    expect(result.scenario).toBe('dice');
    expect(result.params.dice).toBe(2);
    expect(result.params.sides).toBe(6);
    expect(result.confidence).toBe('high');
  });

  it('should parse valid card queries', () => {
    const result = parseNaturalLanguage('draw 5 cards, get 2 aces');
    expect(result.scenario).toBe('cards');
    expect(result.params.draw).toBe(5);
    expect(result.confidence).toBe('high');
  });

  it('should parse valid binomial queries', () => {
    const result = parseNaturalLanguage('12 trials at 5% chance, at least 1 success');
    expect(result.scenario).toBe('binomial');
    expect(result.params.n).toBe(12);
    expect(result.params.p).toBeCloseTo(0.05);
    expect(result.confidence).toBe('high');
  });

  it('should parse dice with d-notation', () => {
    const result = parseNaturalLanguage('3d20 max at least 15');
    expect(result.scenario).toBe('dice');
    expect(result.params.dice).toBe(3);
    expect(result.params.sides).toBe(20);
  });

  it('should parse card queries with suit keywords', () => {
    const result = parseNaturalLanguage('draw 7 cards from deck, any hearts');
    expect(result.scenario).toBe('cards');
    expect(result.params.draw).toBe(7);
  });

  it('should parse binomial with flip keyword', () => {
    const result = parseNaturalLanguage('10 coin flips, at least 7 successes');
    expect(result.scenario).toBe('binomial');
    expect(result.params.n).toBe(10);
  });
});

describe('NL Parser - Edge Cases', () => {
  it('should reject invalid dice counts', () => {
    const result = parseNaturalLanguage('roll 0 dice');
    expect(result.scenario).toBeNull();
  });

  it('should reject invalid card counts', () => {
    const result = parseNaturalLanguage('draw 100 cards');
    expect(result.scenario).toBeNull();
  });

  it('should reject invalid trial counts', () => {
    const result = parseNaturalLanguage('0 trials at 50% chance');
    expect(result.scenario).toBeNull();
  });

  it('should reject invalid probability values', () => {
    const result = parseNaturalLanguage('10 trials at 150% chance');
    expect(result.scenario).toBeNull();
  });
});
