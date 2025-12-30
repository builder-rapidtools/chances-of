import express, { Request, Response } from 'express';
import cors from 'cors';
import { runDiceSimulation } from '../src/scenarios/dice.js';
import { runCardsSimulation } from '../src/scenarios/cards.js';
import { runBinomialSimulation } from '../src/scenarios/binomial.js';
import { MonteCarloOptions } from '../src/engine/monteCarlo.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

interface RunRequest {
  scenario: 'dice' | 'cards' | 'binomial';
  params: any;
  options?: {
    seed?: number;
    trials?: number;
    target_ci_width?: number;
    max_trials?: number;
    batch?: number;
    exact?: boolean;
  };
}

// Validation helpers
function isValidNumber(value: any): boolean {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

function validateDiceParams(params: any): string | null {
  if (!isValidNumber(params.dice)) {
    return 'dice must be a valid number';
  }
  if (params.dice < 1 || params.dice > 100) {
    return 'dice must be between 1 and 100';
  }

  if (!isValidNumber(params.sides)) {
    return 'sides must be a valid number';
  }
  if (params.sides < 2 || params.sides > 10000) {
    return 'sides must be between 2 and 10000';
  }

  if (typeof params.condition !== 'string' || params.condition.trim() === '') {
    return 'condition must be a non-empty string';
  }

  return null;
}

function validateCardsParams(params: any): string | null {
  if (!isValidNumber(params.draw)) {
    return 'draw must be a valid number';
  }
  if (params.draw < 1 || params.draw > 52) {
    return 'draw must be between 1 and 52';
  }

  if (typeof params.condition !== 'string' || params.condition.trim() === '') {
    return 'condition must be a non-empty string';
  }

  return null;
}

function validateBinomialParams(params: any): string | null {
  if (!isValidNumber(params.n)) {
    return 'n must be a valid number';
  }
  if (params.n < 1 || params.n > 10000) {
    return 'n must be between 1 and 10000';
  }

  if (!isValidNumber(params.p)) {
    return 'p must be a valid number';
  }
  if (params.p <= 0 || params.p > 1) {
    return 'p must be between 0 (exclusive) and 1 (inclusive)';
  }

  if (typeof params.condition !== 'string' || params.condition.trim() === '') {
    return 'condition must be a non-empty string';
  }

  return null;
}

function validateOptions(options: any): string | null {
  if (options.seed !== undefined && !isValidNumber(options.seed)) {
    return 'seed must be a valid number';
  }

  if (options.trials !== undefined) {
    if (!isValidNumber(options.trials)) {
      return 'trials must be a valid number';
    }
    if (options.trials < 1 || options.trials > 1000000) {
      return 'trials must be between 1 and 1000000';
    }
  }

  if (options.max_trials !== undefined) {
    if (!isValidNumber(options.max_trials)) {
      return 'max_trials must be a valid number';
    }
    if (options.max_trials < 1 || options.max_trials > 1000000) {
      return 'max_trials must be between 1 and 1000000';
    }
  }

  if (options.target_ci_width !== undefined) {
    if (!isValidNumber(options.target_ci_width)) {
      return 'target_ci_width must be a valid number';
    }
    if (options.target_ci_width <= 0 || options.target_ci_width > 1) {
      return 'target_ci_width must be between 0 (exclusive) and 1 (inclusive)';
    }
  }

  if (options.batch !== undefined) {
    if (!isValidNumber(options.batch)) {
      return 'batch must be a valid number';
    }
    if (options.batch < 1) {
      return 'batch must be at least 1';
    }
  }

  return null;
}

app.post('/api/run', (req: Request, res: Response) => {
  const startTime = Date.now();

  try {
    const { scenario, params, options = {} } = req.body as RunRequest;

    // Validate scenario
    if (!scenario || !['dice', 'cards', 'binomial'].includes(scenario)) {
      return res.status(400).json({
        error: 'Invalid scenario. Must be "dice", "cards", or "binomial".',
      });
    }

    // Validate params based on scenario
    let validationError: string | null = null;
    switch (scenario) {
      case 'dice':
        validationError = validateDiceParams(params);
        break;
      case 'cards':
        validationError = validateCardsParams(params);
        break;
      case 'binomial':
        validationError = validateBinomialParams(params);
        break;
    }

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    // Validate options
    const optionsError = validateOptions(options);
    if (optionsError) {
      return res.status(400).json({ error: optionsError });
    }

    // Build Monte Carlo options
    const mcOptions: MonteCarloOptions = {
      seed: options.seed ?? 42,
      trials: options.trials,
      targetCIWidth: options.target_ci_width,
      maxTrials: options.max_trials,
      batchSize: options.batch,
    };

    let result: any;

    try {
      switch (scenario) {
        case 'dice':
          result = runDiceSimulation(
            {
              dice: params.dice,
              sides: params.sides,
              condition: params.condition,
            },
            mcOptions
          );
          break;

        case 'cards':
          result = runCardsSimulation(
            {
              draw: params.draw,
              condition: params.condition,
              exact: options.exact,
            },
            mcOptions
          );
          break;

        case 'binomial':
          result = runBinomialSimulation(
            {
              n: params.n,
              p: params.p,
              condition: params.condition,
              exact: options.exact,
            },
            mcOptions
          );
          break;
      }
    } catch (error: any) {
      return res.status(400).json({
        error: error.message || 'Invalid parameters or condition',
      });
    }

    const time_ms = Date.now() - startTime;

    // Return same JSON schema as CLI --json output
    const response = {
      scenario,
      params,
      trials: result.trials,
      successes: result.exact ? null : result.successes,
      probability: result.probability,
      ci_low: result.ci_low,
      ci_high: result.ci_high,
      exact: result.exact || false,
      time_ms,
      stop_reason: result.stop_reason,
    };

    res.json(response);
  } catch (error: any) {
    console.error('Server error:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

app.listen(PORT, () => {
  console.log(`chances-of API server running on http://localhost:${PORT}`);
});
