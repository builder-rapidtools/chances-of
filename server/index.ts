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
          if (!params.dice || !params.sides || !params.condition) {
            return res.status(400).json({
              error: 'Dice scenario requires: dice, sides, condition',
            });
          }
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
          if (!params.draw || !params.condition) {
            return res.status(400).json({
              error: 'Cards scenario requires: draw, condition',
            });
          }
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
          if (params.n === undefined || params.p === undefined || !params.condition) {
            return res.status(400).json({
              error: 'Binomial scenario requires: n, p, condition',
            });
          }
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
