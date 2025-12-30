// Cloudflare Worker API for chances-of
// Reuses simulation code from main project

import { runDiceSimulation } from '../../../src/scenarios/dice.js';
import { runCardsSimulation } from '../../../src/scenarios/cards.js';
import { runBinomialSimulation } from '../../../src/scenarios/binomial.js';
import { MonteCarloOptions } from '../../../src/engine/monteCarlo.js';

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

// CORS headers for browser access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function handleCors(request: Request): Response | null {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
    });
  }
  return null;
}

async function handleRun(request: Request): Promise<Response> {
  const startTime = Date.now();

  try {
    const body: RunRequest = await request.json();
    const { scenario, params, options = {} } = body;

    // Validate scenario
    if (!scenario || !['dice', 'cards', 'binomial'].includes(scenario)) {
      return new Response(
        JSON.stringify({
          error: 'Invalid scenario. Must be "dice", "cards", or "binomial".',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
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
            return new Response(
              JSON.stringify({
                error: 'Dice scenario requires: dice, sides, condition',
              }),
              {
                status: 400,
                headers: { 'Content-Type': 'application/json', ...corsHeaders },
              }
            );
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
            return new Response(
              JSON.stringify({
                error: 'Cards scenario requires: draw, condition',
              }),
              {
                status: 400,
                headers: { 'Content-Type': 'application/json', ...corsHeaders },
              }
            );
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
            return new Response(
              JSON.stringify({
                error: 'Binomial scenario requires: n, p, condition',
              }),
              {
                status: 400,
                headers: { 'Content-Type': 'application/json', ...corsHeaders },
              }
            );
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
      return new Response(
        JSON.stringify({
          error: error.message || 'Invalid parameters or condition',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
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

    return new Response(JSON.stringify(response), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error: any) {
    console.error('Worker error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
}

export default {
  async fetch(request: Request): Promise<Response> {
    // Handle CORS preflight
    const corsResponse = handleCors(request);
    if (corsResponse) return corsResponse;

    const url = new URL(request.url);

    // Route: POST /api/run
    if (url.pathname === '/api/run' && request.method === 'POST') {
      return handleRun(request);
    }

    // 404 for all other routes
    return new Response('Not Found', {
      status: 404,
      headers: corsHeaders,
    });
  },
};
