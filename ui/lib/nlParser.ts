export interface ParsedScenario {
  scenario: 'dice' | 'cards' | 'binomial' | null;
  params: any;
  options: any;
  interpretation: string;
  confidence: 'high' | 'medium' | 'low';
  examples?: string[];
  transformHint?: string;
}

export function parseNaturalLanguage(input: string): ParsedScenario {
  const lower = input.toLowerCase().trim();

  // Domain gating: check for required keywords first
  const hasDiceKeywords = /\b(dice|roll|sides?|faces?)\b|d\d+/.test(lower);
  const hasCardKeywords = /\b(card|cards|deck|draw|deal|ace|aces|hearts?|diamonds?|clubs?|spades?|jack|queen|king)\b/.test(lower);
  const hasBinomialKeywords = /\b(trial|trials|flip|flips|toss|tosses|coin|attempt|attempts|independent|each|per)\b/.test(lower) || /%\s*(?:chance|probability|success)/.test(lower);

  // Dice patterns
  const diceMatch = lower.match(/(\d+)\s*(?:d(\d+)|(?:dice|die)(?:\s*(?:with|of)?\s*(\d+)\s*(?:sides?|faces?))?)/);
  if (hasDiceKeywords && diceMatch) {
    const dice = parseInt(diceMatch[1]);
    const sides = diceMatch[2] ? parseInt(diceMatch[2]) : (diceMatch[3] ? parseInt(diceMatch[3]) : 6);

    // Validate extracted params
    if (!dice || dice < 1) {
      return {
        scenario: null,
        params: {},
        options: {},
        interpretation: "Number of dice must be at least 1.",
        confidence: 'low',
        examples: [
          'roll 2d6, sum at least 7',
          'roll 1 die with 20 sides, max at least 18',
        ],
      };
    }
    if (dice > 100) {
      return {
        scenario: null,
        params: {},
        options: {},
        interpretation: `Number of dice must not exceed 100 (you requested ${dice}).`,
        confidence: 'low',
        examples: [
          'roll 10d6, sum at least 35',
          'roll 50 dice with 6 sides, sum at least 175',
        ],
      };
    }
    if (!sides || sides < 2) {
      return {
        scenario: null,
        params: {},
        options: {},
        interpretation: "Number of sides must be at least 2.",
        confidence: 'low',
        examples: [
          'roll 2d6, sum at least 7',
          'roll 3 dice with 10 sides, sum at least 20',
        ],
      };
    }
    if (sides > 10000) {
      return {
        scenario: null,
        params: {},
        options: {},
        interpretation: `Number of sides must not exceed 10000 (you requested ${sides}).`,
        confidence: 'low',
        examples: [
          'roll 2d1000, sum at least 1500',
          'roll 1 die with 1000 sides, max at least 900',
        ],
      };
    }

    // Look for conditions
    let condition = 'sum>=7';
    let conditionDesc = 'sum is 7 or higher';

    const sumMatch = lower.match(/sum\s*(?:is|=|==|>=|>|<=|<|at least)?\s*(\d+)/);
    const maxMatch = lower.match(/(?:at least one|any|max).*?(\d+)\s*or\s*(?:higher|more|above)/);
    const minMatch = lower.match(/(?:all|every|min).*?(\d+)\s*or\s*(?:higher|more|above)/);

    if (sumMatch) {
      const target = parseInt(sumMatch[1]);
      const maxPossible = dice * sides;
      const minPossible = dice;

      if (lower.includes('exactly') || lower.includes('equal')) {
        condition = `sum==${target}`;
        conditionDesc = `sum equals exactly ${target}`;
        if (target > maxPossible || target < minPossible) {
          return {
            scenario: null,
            params: {},
            options: {},
            interpretation: `Sum cannot equal ${target} with ${dice} ${dice === 1 ? 'die' : 'dice'} of ${sides} sides (range: ${minPossible}-${maxPossible}).`,
            confidence: 'low',
            examples: [
              `roll ${dice}d${sides}, sum exactly ${Math.floor((minPossible + maxPossible) / 2)}`,
              `roll ${dice}d${sides}, sum at least ${Math.ceil(maxPossible * 0.6)}`,
            ],
          };
        }
      } else {
        condition = `sum>=${target}`;
        conditionDesc = `sum is ${target} or higher`;
        if (target > maxPossible) {
          return {
            scenario: null,
            params: {},
            options: {},
            interpretation: `Sum cannot exceed ${maxPossible} with ${dice} ${dice === 1 ? 'die' : 'dice'} of ${sides} sides (you requested at least ${target}).`,
            confidence: 'low',
            examples: [
              `roll ${dice}d${sides}, sum at least ${Math.ceil(maxPossible * 0.6)}`,
              `roll ${dice}d${sides}, sum at least ${Math.ceil(maxPossible * 0.8)}`,
            ],
          };
        }
      }
    } else if (maxMatch) {
      const target = parseInt(maxMatch[1]);
      if (target > sides) {
        return {
          scenario: null,
          params: {},
          options: {},
          interpretation: `Maximum die value cannot exceed ${sides} with ${sides}-sided ${dice === 1 ? 'die' : 'dice'} (you requested at least ${target}).`,
          confidence: 'low',
          examples: [
            `roll ${dice}d${sides}, max at least ${Math.ceil(sides * 0.8)}`,
            `roll ${dice}d${sides}, max at least ${sides}`,
          ],
        };
      }
      condition = `max>=${target}`;
      conditionDesc = `at least one die shows ${target} or higher`;
    } else if (minMatch) {
      const target = parseInt(minMatch[1]);
      if (target > sides) {
        return {
          scenario: null,
          params: {},
          options: {},
          interpretation: `Minimum die value cannot exceed ${sides} with ${sides}-sided ${dice === 1 ? 'die' : 'dice'} (you requested at least ${target}).`,
          confidence: 'low',
          examples: [
            `roll ${dice}d${sides}, min at least ${Math.ceil(sides * 0.5)}`,
            `roll ${dice}d${sides}, min at least ${sides}`,
          ],
        };
      }
      condition = `min>=${target}`;
      conditionDesc = `all dice show ${target} or higher`;
    }

    return {
      scenario: 'dice',
      params: { dice, sides, condition },
      options: { seed: 42, exact: false, trials: 100000 },
      interpretation: `Rolling ${dice} ${dice === 1 ? 'die' : 'dice'} with ${sides} sides each, checking if ${conditionDesc}`,
      confidence: sumMatch || maxMatch || minMatch ? 'high' : 'medium',
    };
  }

  // Card patterns
  const cardMatch = lower.match(/(?:draw|drawing|deal|dealt?)\s*(\d+)\s*(?:card|cards)/);
  const cardCountMatch = lower.match(/(\d+)\s*(?:card|cards)/);

  if (hasCardKeywords && cardCountMatch) {
    const draw = parseInt(cardCountMatch[1]);

    // Validate extracted params
    if (!draw || draw < 1) {
      return {
        scenario: null,
        params: {},
        options: {},
        interpretation: "Number of cards to draw must be at least 1.",
        confidence: 'low',
        examples: [
          'draw 5 cards, get 2 aces',
          'draw 7 cards, get 3 hearts',
        ],
      };
    }
    if (draw > 52) {
      return {
        scenario: null,
        params: {},
        options: {},
        interpretation: `Cannot draw more than 52 cards from a standard deck (you requested ${draw}).`,
        confidence: 'low',
        examples: [
          'draw 5 cards, get 2 aces',
          'draw 10 cards, get 3 hearts',
        ],
      };
    }

    let condition = 'aces>=1';
    let conditionDesc = 'at least 1 ace';

    const acesMatch = lower.match(/(\d+)\s*(?:or more\s*)?(?:ace|aces)/);
    const heartsMatch = lower.match(/(\d+)\s*(?:or more\s*)?(?:heart|hearts)/);
    const rankMatch = lower.match(/(?:at least one|any)\s*([2-9]|10|jack|queen|king|ace)/i);
    const suitMatch = lower.match(/(?:at least one|any)\s*(heart|diamond|club|spade)s?/i);

    if (acesMatch) {
      const count = parseInt(acesMatch[1]);
      if (count > 4) {
        return {
          scenario: null,
          params: {},
          options: {},
          interpretation: `Cannot get more than 4 aces from a standard deck (you requested ${count}).`,
          confidence: 'low',
          examples: [
            `draw ${draw} cards, get 2 aces`,
            `draw ${draw} cards, get ${Math.min(draw, 4)} aces`,
          ],
        };
      }
      if (count > draw) {
        return {
          scenario: null,
          params: {},
          options: {},
          interpretation: `Cannot draw ${count} aces from only ${draw} ${draw === 1 ? 'card' : 'cards'}.`,
          confidence: 'low',
          examples: [
            `draw ${count} cards, get ${count} aces`,
            `draw ${Math.max(draw, count)} cards, get ${Math.min(draw, count)} aces`,
          ],
        };
      }
      condition = `aces>=${count}`;
      conditionDesc = `${count} or more ${count === 1 ? 'ace' : 'aces'}`;
    } else if (heartsMatch) {
      const count = parseInt(heartsMatch[1]);
      if (count > 13) {
        return {
          scenario: null,
          params: {},
          options: {},
          interpretation: `Cannot get more than 13 hearts from a standard deck (you requested ${count}).`,
          confidence: 'low',
          examples: [
            `draw ${draw} cards, get 3 hearts`,
            `draw ${draw} cards, get ${Math.min(draw, 13)} hearts`,
          ],
        };
      }
      if (count > draw) {
        return {
          scenario: null,
          params: {},
          options: {},
          interpretation: `Cannot draw ${count} hearts from only ${draw} ${draw === 1 ? 'card' : 'cards'}.`,
          confidence: 'low',
          examples: [
            `draw ${count} cards, get ${count} hearts`,
            `draw ${Math.max(draw, count)} cards, get ${Math.min(draw, count)} hearts`,
          ],
        };
      }
      condition = `hearts>=${count}`;
      conditionDesc = `${count} or more ${count === 1 ? 'heart' : 'hearts'}`;
    } else if (rankMatch) {
      const rank = rankMatch[1].toLowerCase();
      condition = `any_rank=${rank}`;
      conditionDesc = `at least one ${rank}`;
    } else if (suitMatch) {
      const suit = suitMatch[1].toLowerCase();
      condition = `any_suit=${suit}s`;
      conditionDesc = `at least one ${suit}`;
    }

    return {
      scenario: 'cards',
      params: { draw, condition },
      options: { seed: 42, exact: false, trials: 100000 },
      interpretation: `Drawing ${draw} ${draw === 1 ? 'card' : 'cards'} from a standard 52-card deck, checking for ${conditionDesc}`,
      confidence: acesMatch || heartsMatch || rankMatch || suitMatch ? 'high' : 'medium',
    };
  }

  // Binomial patterns
  const trialsMatch = lower.match(/(\d+)\s*(?:\w+\s+)?(?:trials?|attempts?|times|flips?|tosses?)/);
  const probMatch = lower.match(/(\d+(?:\.\d+)?)\s*%\s*(?:chance|probability|success)/);
  const probFracMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:chance|probability|success)/);

  if (hasBinomialKeywords && trialsMatch) {
    const n = parseInt(trialsMatch[1]);
    let p = 0.5;

    if (probMatch) {
      p = parseFloat(probMatch[1]) / 100;
    } else if (probFracMatch && !probMatch) {
      const val = parseFloat(probFracMatch[1]);
      // Fix ambiguity: treat 1 as 1% not 100%
      p = val >= 1 ? val / 100 : val;
    }

    // Validate extracted params
    if (!n || n < 1) {
      return {
        scenario: null,
        params: {},
        options: {},
        interpretation: "Number of trials must be at least 1.",
        confidence: 'low',
        examples: [
          '12 trials at 5% chance, at least 1 success',
          '20 flips, at least 10 successes',
        ],
      };
    }
    if (n > 10000) {
      return {
        scenario: null,
        params: {},
        options: {},
        interpretation: `Number of trials must not exceed 10000 (you requested ${n}).`,
        confidence: 'low',
        examples: [
          '1000 trials at 5% chance, at least 30 successes',
          '10000 trials at 1% chance, at least 50 successes',
        ],
      };
    }
    if (p <= 0 || p > 1) {
      return {
        scenario: null,
        params: {},
        options: {},
        interpretation: "Probability must be between 0 (exclusive) and 1 (inclusive). Use percentages like '5% chance' or decimals like '0.05 chance'.",
        confidence: 'low',
        examples: [
          `${n} trials at 5% chance, at least 1 success`,
          `${n} trials at 0.5 chance, at least ${Math.ceil(n * 0.25)} successes`,
        ],
      };
    }

    let condition = 'successes>=1';
    let conditionDesc = 'at least 1 success';

    const successMatch = lower.match(/(?:at least\s*)?(\d+)\s*(?:or more\s*)?(?:success|successes|wins?|hits?)/);
    const exactMatch = lower.match(/exactly\s*(\d+)\s*(?:success|successes|wins?|hits?)/);

    if (exactMatch) {
      const count = parseInt(exactMatch[1]);
      if (count > n) {
        return {
          scenario: null,
          params: {},
          options: {},
          interpretation: `Cannot get ${count} successes from only ${n} ${n === 1 ? 'trial' : 'trials'}.`,
          confidence: 'low',
          examples: [
            `${count} trials at ${(p * 100).toFixed(1)}% chance, exactly ${count} successes`,
            `${n} trials at ${(p * 100).toFixed(1)}% chance, exactly ${Math.min(n, count)} successes`,
          ],
        };
      }
      condition = `successes==${count}`;
      conditionDesc = `exactly ${count} ${count === 1 ? 'success' : 'successes'}`;
    } else if (successMatch) {
      const count = parseInt(successMatch[1]);
      if (count > n) {
        return {
          scenario: null,
          params: {},
          options: {},
          interpretation: `Cannot get ${count} or more successes from only ${n} ${n === 1 ? 'trial' : 'trials'}.`,
          confidence: 'low',
          examples: [
            `${count} trials at ${(p * 100).toFixed(1)}% chance, at least ${count} successes`,
            `${n} trials at ${(p * 100).toFixed(1)}% chance, at least ${Math.min(n, count)} successes`,
          ],
        };
      }
      condition = `successes>=${count}`;
      conditionDesc = `${count} or more ${count === 1 ? 'success' : 'successes'}`;
    }

    return {
      scenario: 'binomial',
      params: { n, p, condition },
      options: { seed: 42, exact: false, trials: 100000 },
      interpretation: `Running ${n} independent trials, each with ${(p * 100).toFixed(1)}% chance of success, checking for ${conditionDesc}`,
      confidence: trialsMatch && (probMatch || probFracMatch) ? 'high' : 'medium',
    };
  }

  // Failed to parse
  return {
    scenario: null,
    params: {},
    options: {},
    interpretation: "I couldn't confidently interpret that input. I currently understand dice, cards, and repeated-trial scenarios.",
    confidence: 'low',
    examples: [
      'roll 2d6, sum at least 7',
      'draw 5 cards, get 2 aces',
      '12 trials at 5% chance, at least 1 success',
    ],
    transformHint: '"12 eggs, chance an egg breaks" → binomial (n=12, success ≥ 1)',
  };
}
