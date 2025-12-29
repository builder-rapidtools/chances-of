#!/usr/bin/env node

import { Command } from 'commander';
import { runDiceSimulation } from './scenarios/dice.js';
import { runCardsSimulation } from './scenarios/cards.js';
import { runBinomialSimulation } from './scenarios/binomial.js';
import { MonteCarloOptions } from './engine/monteCarlo.js';

const program = new Command();

program
  .name('chances-of')
  .description('CLI tool for calculating probabilities through Monte Carlo simulation and exact calculations')
  .version('1.0.0');

/**
 * Dice command
 */
program
  .command('dice')
  .description('Simulate dice rolls')
  .requiredOption('--dice <number>', 'Number of dice', parseInt)
  .requiredOption('--sides <number>', 'Number of sides per die', parseInt)
  .requiredOption('--condition <string>', 'Condition to check (sum>=X, sum==X, max>=X, min>=X)')
  .option('--trials <number>', 'Number of trials', parseInt)
  .option('--seed <number>', 'Random seed', parseInt, 42)
  .option('--target-ci-width <number>', 'Target confidence interval width', parseFloat)
  .option('--max-trials <number>', 'Maximum trials for precision-stop mode', parseInt, 5000000)
  .option('--batch <number>', 'Batch size for precision-stop mode', parseInt, 10000)
  .option('--json', 'Output as JSON')
  .action((options) => {
    const startTime = Date.now();

    const mcOptions: MonteCarloOptions = {
      seed: options.seed,
      trials: options.trials,
      targetCIWidth: options.targetCiWidth,
      maxTrials: options.maxTrials,
      batchSize: options.batch,
    };

    const result = runDiceSimulation(
      {
        dice: options.dice,
        sides: options.sides,
        condition: options.condition,
      },
      mcOptions
    );

    const time_ms = Date.now() - startTime;

    if (options.json) {
      console.log(
        JSON.stringify({
          scenario: 'dice',
          params: {
            dice: options.dice,
            sides: options.sides,
            condition: options.condition,
          },
          trials: result.trials,
          successes: result.successes,
          probability: result.probability,
          ci_low: result.ci_low,
          ci_high: result.ci_high,
          exact: false,
          time_ms,
          stop_reason: result.stop_reason,
        })
      );
    } else {
      console.log(`Scenario: Dice`);
      console.log(`Dice: ${options.dice}d${options.sides}`);
      console.log(`Condition: ${options.condition}`);
      console.log(`Trials: ${result.trials.toLocaleString()}`);
      console.log(`Successes: ${result.successes.toLocaleString()}`);
      console.log(`Probability: ${result.probability.toFixed(6)}`);
      if (result.ci_low !== null && result.ci_high !== null) {
        console.log(`95% CI: [${result.ci_low.toFixed(6)}, ${result.ci_high.toFixed(6)}]`);
      }
      if (result.stop_reason) {
        console.log(`Stop Reason: ${result.stop_reason}`);
      }
      console.log(`Time: ${time_ms}ms`);
    }
  });

/**
 * Cards command
 */
program
  .command('cards')
  .description('Simulate card draws from a standard 52-card deck')
  .requiredOption('--draw <number>', 'Number of cards to draw', parseInt)
  .requiredOption('--condition <string>', 'Condition to check (aces>=k, hearts>=k, any_rank=K, any_suit=suit)')
  .option('--trials <number>', 'Number of trials', parseInt)
  .option('--seed <number>', 'Random seed', parseInt, 42)
  .option('--exact', 'Use exact hypergeometric calculation (only for aces>=k and hearts>=k)')
  .option('--target-ci-width <number>', 'Target confidence interval width', parseFloat)
  .option('--max-trials <number>', 'Maximum trials for precision-stop mode', parseInt, 5000000)
  .option('--batch <number>', 'Batch size for precision-stop mode', parseInt, 10000)
  .option('--json', 'Output as JSON')
  .action((options) => {
    const startTime = Date.now();

    const mcOptions: MonteCarloOptions = {
      seed: options.seed,
      trials: options.trials,
      targetCIWidth: options.targetCiWidth,
      maxTrials: options.maxTrials,
      batchSize: options.batch,
    };

    const result = runCardsSimulation(
      {
        draw: options.draw,
        condition: options.condition,
        exact: options.exact,
      },
      mcOptions
    );

    const time_ms = Date.now() - startTime;

    if (options.json) {
      console.log(
        JSON.stringify({
          scenario: 'cards',
          params: {
            draw: options.draw,
            condition: options.condition,
          },
          trials: result.trials,
          successes: result.exact ? null : result.successes,
          probability: result.probability,
          ci_low: result.ci_low,
          ci_high: result.ci_high,
          exact: result.exact,
          time_ms,
          stop_reason: result.stop_reason,
        })
      );
    } else {
      console.log(`Scenario: Cards`);
      console.log(`Draw: ${options.draw} cards`);
      console.log(`Condition: ${options.condition}`);
      if (result.exact) {
        console.log(`Mode: Exact Calculation`);
      } else {
        console.log(`Trials: ${result.trials.toLocaleString()}`);
        console.log(`Successes: ${result.successes.toLocaleString()}`);
      }
      console.log(`Probability: ${result.probability.toFixed(6)}`);
      if (result.ci_low !== null && result.ci_high !== null) {
        console.log(`95% CI: [${result.ci_low.toFixed(6)}, ${result.ci_high.toFixed(6)}]`);
      }
      if (result.stop_reason) {
        console.log(`Stop Reason: ${result.stop_reason}`);
      }
      console.log(`Time: ${time_ms}ms`);
    }
  });

/**
 * Binomial command
 */
program
  .command('binomial')
  .description('Simulate binomial distribution')
  .requiredOption('--n <number>', 'Number of trials', parseInt)
  .requiredOption('--p <number>', 'Success probability', parseFloat)
  .requiredOption('--condition <string>', 'Condition to check (successes>=X, successes==X)')
  .option('--trials <number>', 'Number of simulation trials', parseInt)
  .option('--seed <number>', 'Random seed', parseInt, 42)
  .option('--exact', 'Use exact binomial calculation')
  .option('--target-ci-width <number>', 'Target confidence interval width', parseFloat)
  .option('--max-trials <number>', 'Maximum trials for precision-stop mode', parseInt, 5000000)
  .option('--batch <number>', 'Batch size for precision-stop mode', parseInt, 10000)
  .option('--json', 'Output as JSON')
  .action((options) => {
    const startTime = Date.now();

    const mcOptions: MonteCarloOptions = {
      seed: options.seed,
      trials: options.trials,
      targetCIWidth: options.targetCiWidth,
      maxTrials: options.maxTrials,
      batchSize: options.batch,
    };

    const result = runBinomialSimulation(
      {
        n: options.n,
        p: options.p,
        condition: options.condition,
        exact: options.exact,
      },
      mcOptions
    );

    const time_ms = Date.now() - startTime;

    if (options.json) {
      console.log(
        JSON.stringify({
          scenario: 'binomial',
          params: {
            n: options.n,
            p: options.p,
            condition: options.condition,
          },
          trials: result.trials,
          successes: result.exact ? null : result.successes,
          probability: result.probability,
          ci_low: result.ci_low,
          ci_high: result.ci_high,
          exact: result.exact,
          time_ms,
          stop_reason: result.stop_reason,
        })
      );
    } else {
      console.log(`Scenario: Binomial`);
      console.log(`n: ${options.n}, p: ${options.p}`);
      console.log(`Condition: ${options.condition}`);
      if (result.exact) {
        console.log(`Mode: Exact Calculation`);
      } else {
        console.log(`Trials: ${result.trials.toLocaleString()}`);
        console.log(`Successes: ${result.successes.toLocaleString()}`);
      }
      console.log(`Probability: ${result.probability.toFixed(6)}`);
      if (result.ci_low !== null && result.ci_high !== null) {
        console.log(`95% CI: [${result.ci_low.toFixed(6)}, ${result.ci_high.toFixed(6)}]`);
      }
      if (result.stop_reason) {
        console.log(`Stop Reason: ${result.stop_reason}`);
      }
      console.log(`Time: ${time_ms}ms`);
    }
  });

program.parse();
