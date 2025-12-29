export interface ParsedScenario {
  scenario: 'dice' | 'cards' | 'binomial' | null;
  params: any;
  options: any;
  interpretation: string;
  confidence: 'high' | 'medium' | 'low';
}

export function parseNaturalLanguage(input: string): ParsedScenario {
  const lower = input.toLowerCase().trim();

  // Dice patterns
  const diceMatch = lower.match(/(\d+)\s*(?:d|dice|die)(?:\s*(?:with|of)?\s*(\d+)\s*(?:sides?|faces?))?/);
  if (diceMatch || lower.includes('roll') || lower.includes('dice') || lower.includes('die')) {
    const dice = diceMatch ? parseInt(diceMatch[1]) : 2;
    const sides = diceMatch && diceMatch[2] ? parseInt(diceMatch[2]) : 6;

    // Look for conditions
    let condition = 'sum>=7';
    let conditionDesc = 'sum is 7 or higher';

    const sumMatch = lower.match(/sum\s*(?:is|=|==|>=|>|<=|<|at least)?\s*(\d+)/);
    const maxMatch = lower.match(/(?:at least one|any|max).*?(\d+)\s*or\s*(?:higher|more|above)/);
    const minMatch = lower.match(/(?:all|every|min).*?(\d+)\s*or\s*(?:higher|more|above)/);

    if (sumMatch) {
      const target = parseInt(sumMatch[1]);
      if (lower.includes('exactly') || lower.includes('equal')) {
        condition = `sum==${target}`;
        conditionDesc = `sum equals exactly ${target}`;
      } else {
        condition = `sum>=${target}`;
        conditionDesc = `sum is ${target} or higher`;
      }
    } else if (maxMatch) {
      const target = parseInt(maxMatch[1]);
      condition = `max>=${target}`;
      conditionDesc = `at least one die shows ${target} or higher`;
    } else if (minMatch) {
      const target = parseInt(minMatch[1]);
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
  if (cardMatch || lower.includes('card') || lower.includes('deck')) {
    const draw = cardMatch ? parseInt(cardMatch[1]) : 2;

    let condition = 'aces>=1';
    let conditionDesc = 'at least 1 ace';

    const acesMatch = lower.match(/(\d+)\s*(?:or more\s*)?(?:ace|aces)/);
    const heartsMatch = lower.match(/(\d+)\s*(?:or more\s*)?(?:heart|hearts)/);
    const rankMatch = lower.match(/(?:at least one|any)\s*([2-9]|10|jack|queen|king|ace)/i);
    const suitMatch = lower.match(/(?:at least one|any)\s*(heart|diamond|club|spade)s?/i);

    if (acesMatch) {
      const count = parseInt(acesMatch[1]);
      condition = `aces>=${count}`;
      conditionDesc = `${count} or more ${count === 1 ? 'ace' : 'aces'}`;
    } else if (heartsMatch) {
      const count = parseInt(heartsMatch[1]);
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
  const trialsMatch = lower.match(/(\d+)\s*(?:trials?|attempts?|times|flips?|tosses?)/);
  const probMatch = lower.match(/(\d+(?:\.\d+)?)\s*%\s*(?:chance|probability|success)/);
  const probFracMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:chance|probability|success)/);

  if (trialsMatch || probMatch || probFracMatch || lower.includes('trial') || lower.includes('flip')) {
    const n = trialsMatch ? parseInt(trialsMatch[1]) : 20;
    let p = 0.5;

    if (probMatch) {
      p = parseFloat(probMatch[1]) / 100;
    } else if (probFracMatch && !probMatch) {
      const val = parseFloat(probFracMatch[1]);
      p = val > 1 ? val / 100 : val;
    }

    let condition = 'successes>=1';
    let conditionDesc = 'at least 1 success';

    const successMatch = lower.match(/(?:at least\s*)?(\d+)\s*(?:or more\s*)?(?:success|successes|wins?|hits?)/);
    const exactMatch = lower.match(/exactly\s*(\d+)\s*(?:success|successes|wins?|hits?)/);

    if (exactMatch) {
      const count = parseInt(exactMatch[1]);
      condition = `successes==${count}`;
      conditionDesc = `exactly ${count} ${count === 1 ? 'success' : 'successes'}`;
    } else if (successMatch) {
      const count = parseInt(successMatch[1]);
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
    interpretation: 'I can currently parse: dice, cards, binomial. Examples: "roll 2d6, sum at least 7" · "draw 5 cards, get 2 aces" · "12 trials at 5% chance, at least 1 success" — If you have an egg-breaking problem, think: each egg has break chance p, so n=12 eggs, condition: successes>=1.',
    confidence: 'low',
  };
}
