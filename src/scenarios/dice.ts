import { SeededRNG } from '../util/rng.js';
import { runMonteCarlo, MonteCarloOptions, MonteCarloResult } from '../engine/monteCarlo.js';

export interface DiceParams {
  dice: number;
  sides: number;
  condition: string;
}

interface ParsedCondition {
  type: 'sum' | 'max' | 'min';
  operator: '>=' | '==';
  value: number;
}

/**
 * Parse dice condition string
 * Supported: sum>=X, sum==X, max>=X, min>=X
 */
function parseCondition(condition: string): ParsedCondition {
  const patterns = [
    { regex: /^sum>=(\d+)$/, type: 'sum' as const, operator: '>=' as const },
    { regex: /^sum==(\d+)$/, type: 'sum' as const, operator: '==' as const },
    { regex: /^max>=(\d+)$/, type: 'max' as const, operator: '>=' as const },
    { regex: /^min>=(\d+)$/, type: 'min' as const, operator: '>=' as const },
  ];

  for (const pattern of patterns) {
    const match = condition.match(pattern.regex);
    if (match) {
      return {
        type: pattern.type,
        operator: pattern.operator,
        value: parseInt(match[1], 10),
      };
    }
  }

  throw new Error(
    `Invalid dice condition: ${condition}. Supported: sum>=X, sum==X, max>=X, min>=X`
  );
}

/**
 * Check if dice roll meets condition
 */
function checkCondition(rolls: number[], condition: ParsedCondition): boolean {
  let value: number;

  switch (condition.type) {
    case 'sum':
      value = rolls.reduce((a, b) => a + b, 0);
      break;
    case 'max':
      value = Math.max(...rolls);
      break;
    case 'min':
      value = Math.min(...rolls);
      break;
  }

  switch (condition.operator) {
    case '>=':
      return value >= condition.value;
    case '==':
      return value === condition.value;
  }
}

/**
 * Run dice simulation
 */
export function runDiceSimulation(
  params: DiceParams,
  options: MonteCarloOptions
): MonteCarloResult {
  const parsedCondition = parseCondition(params.condition);

  const trialFn = (rng: SeededRNG): boolean => {
    const rolls: number[] = [];
    for (let i = 0; i < params.dice; i++) {
      rolls.push(rng.nextInt(1, params.sides));
    }
    return checkCondition(rolls, parsedCondition);
  };

  return runMonteCarlo(trialFn, options);
}
