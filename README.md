# chances-of

A TypeScript CLI tool for calculating probabilities through Monte Carlo simulation and exact mathematical calculations.

## Features

- Monte Carlo simulation with seedable RNG for reproducible results
- Exact calculations using hypergeometric and binomial distributions
- 95% confidence intervals using Wilson score method
- Adaptive precision-stop mode to reach target confidence interval width
- JSON output mode for programmatic use
- Three probability scenarios: dice, cards, and binomial

## Installation

```bash
npm install
npm run build
```

## Web UI

**chances-of** includes a local web interface for interactive probability exploration.

### Running the Web UI

```bash
npm run dev
```

This starts both the API server (port 3001) and the UI dev server (port 3000). Open your browser to:

```
http://localhost:3000
```

### Using the Web UI

The interface is divided into two panels:

- **Left Panel**: Configure your scenario (dice, cards, or binomial), set parameters, and adjust simulation options
- **Right Panel**: View results including probability, confidence intervals, and detailed metadata

The UI shows:
- Large, clear probability display
- Visual confidence interval bar showing uncertainty range
- Simulation metadata (trials, time, stop reason)
- Assumptions box echoing all parameters and options

**Note**: The Web UI is a tool for exploring probabilistic assumptions. Confidence intervals express the uncertainty inherent in Monte Carlo estimation. Exact mode eliminates simulation variance by using mathematical formulas.

### API Endpoint

The server exposes a single endpoint:

**POST** `/api/run`

Request body:
```json
{
  "scenario": "dice|cards|binomial",
  "params": {
    // scenario-specific parameters
  },
  "options": {
    "seed": 42,
    "trials": 100000,
    "exact": false,
    "target_ci_width": 0.01
  }
}
```

Response: Same JSON schema as CLI `--json` output.

## CLI Usage

```bash
chances-of <scenario> [options]
```

### Global Options

- `--seed <number>`: Random seed for reproducible results (default: 42)
- `--trials <number>`: Number of Monte Carlo trials
- `--target-ci-width <number>`: Target confidence interval width (activates precision-stop mode)
- `--max-trials <number>`: Maximum trials in precision-stop mode (default: 5000000)
- `--batch <number>`: Batch size for precision-stop mode (default: 10000)
- `--json`: Output results as JSON

## Scenarios

### 1. Dice

Simulate rolling dice and checking conditions on the results.

```bash
chances-of dice --dice <number> --sides <number> --condition <condition> [options]
```

**Supported Conditions:**
- `sum>=X`: Sum of all dice is at least X
- `sum==X`: Sum of all dice equals X
- `max>=X`: Highest die is at least X
- `min>=X`: Lowest die is at least X

**Example:**

```bash
chances-of dice --dice 2 --sides 6 --condition "sum>=10" --trials 200000 --seed 42
```

Output:
```
Scenario: Dice
Dice: 2d6
Condition: sum>=10
Trials: 200,000
Successes: 33,299
Probability: 0.166495
95% CI: [0.164246, 0.168756]
Time: 45ms
```

### 2. Cards

Simulate drawing cards from a standard 52-card deck (without replacement).

```bash
chances-of cards --draw <number> --condition <condition> [options]
```

**Supported Conditions:**
- `aces>=k`: At least k aces in the draw
- `hearts>=k`: At least k hearts in the draw
- `any_rank=K`: At least one card of rank K (A, 2-10, J, Q, K)
- `any_suit=hearts`: At least one card of suit (hearts, diamonds, clubs, spades)

**Exact Mode:**
Use `--exact` flag for hypergeometric calculation. Only supported for `aces>=k` and `hearts>=k` conditions.

**Examples:**

Monte Carlo simulation:
```bash
chances-of cards --draw 2 --condition "aces>=2" --trials 200000 --seed 42
```

Exact calculation:
```bash
chances-of cards --draw 2 --condition "aces>=2" --exact
```

Output:
```
Scenario: Cards
Draw: 2 cards
Condition: aces>=2
Mode: Exact Calculation
Probability: 0.004525
Time: 1ms
```

### 3. Binomial

Simulate binomial distribution (n independent trials with success probability p).

```bash
chances-of binomial --n <number> --p <probability> --condition <condition> [options]
```

**Supported Conditions:**
- `successes>=X`: At least X successes
- `successes==X`: Exactly X successes

**Exact Mode:**
Use `--exact` flag for exact binomial calculation.

**Examples:**

Monte Carlo simulation:
```bash
chances-of binomial --n 20 --p 0.1 --condition "successes>=3" --trials 100000 --seed 42
```

Exact calculation:
```bash
chances-of binomial --n 20 --p 0.1 --condition "successes>=3" --exact
```

Output:
```
Scenario: Binomial
n: 20, p: 0.1
Condition: successes>=3
Mode: Exact Calculation
Probability: 0.323115
Time: 0ms
```

## Precision-Stop Mode

When `--target-ci-width` is specified, the simulation runs adaptively until the confidence interval width reaches the target or max trials is reached.

```bash
chances-of dice --dice 1 --sides 6 --condition "sum>=6" --target-ci-width 0.02
```

Output includes stop reason:
```
Stop Reason: Target CI width reached
```

If both `--trials` and `--target-ci-width` are specified, `--target-ci-width` takes precedence.

## JSON Output

Use `--json` flag to output results in JSON format for programmatic use.

```bash
chances-of dice --dice 2 --sides 6 --condition "sum>=10" --trials 10000 --json
```

JSON Schema:
```json
{
  "scenario": "dice|cards|binomial",
  "params": {
    // scenario-specific parameters
  },
  "trials": 10000,
  "successes": 1667,
  "probability": 0.1667,
  "ci_low": 0.1595,
  "ci_high": 0.1741,
  "exact": false,
  "time_ms": 42,
  "stop_reason": null
}
```

For exact calculations:
- `trials` is 0
- `successes` is null
- `ci_low` and `ci_high` are null
- `exact` is true

## Technical Details

### Random Number Generator

Uses Mulberry32 seedable PRNG for deterministic, reproducible results.

### Confidence Intervals

Calculates 95% confidence intervals using the Wilson score method, which is more accurate than normal approximation, especially for:
- Small sample sizes
- Probabilities near 0 or 1

Intervals are always clamped to [0, 1].

### Exact Calculations

**Cards (Hypergeometric Distribution):**
For `aces>=k` and `hearts>=k`:
```
P(X >= k) = sum_{x=k..min(n,K)} C(K,x) * C(N-K,n-x) / C(N,n)
```
where:
- N = 52 (total cards)
- K = 4 (aces) or 13 (hearts)
- n = cards drawn
- k = minimum successes

**Binomial Distribution:**
For `successes>=k`:
```
P(X >= k) = sum_{x=k..n} C(n,x) * p^x * (1-p)^(n-x)
```

For `successes==k`:
```
P(X = k) = C(n,k) * p^k * (1-p)^(n-k)
```

## Limitations

- Cards scenario only supports standard 52-card deck
- Exact mode for cards only supports `aces>=k` and `hearts>=k` conditions
- Maximum trials capped at 5,000,000 in precision-stop mode
- All exact calculations use built-in floating-point arithmetic (no arbitrary precision)

## Examples

### Find probability of rolling at least 10 with 2d6:
```bash
chances-of dice --dice 2 --sides 6 --condition "sum>=10" --trials 100000
```

### Calculate exact probability of drawing 2 aces:
```bash
chances-of cards --draw 2 --condition "aces>=2" --exact
```

### Simulate coin flips with adaptive sampling:
```bash
chances-of binomial --n 10 --p 0.5 --condition "successes>=7" --target-ci-width 0.01
```

### Get JSON output for scripting:
```bash
chances-of binomial --n 20 --p 0.1 --condition "successes>=3" --exact --json | jq '.probability'
```

## Development

### Scripts

- `npm run build`: Compile TypeScript to JavaScript
- `npm test`: Run test suite with Vitest
- `npm start`: Run the CLI (must build first)
- `npm run dev`: Run both API server and UI dev server concurrently
- `npm run dev:api`: Run API server in watch mode
- `npm run dev:ui`: Run Vite UI dev server

### Project Structure

```
src/
  cli.ts                    # CLI interface
  engine/monteCarlo.ts      # Monte Carlo simulation engine
  stats/wilson.ts           # Wilson CI calculation
  util/rng.ts              # Seedable RNG
  scenarios/
    dice.ts                # Dice simulation
    cards.ts               # Cards simulation
    binomial.ts            # Binomial simulation
server/
  index.ts                 # Express API server
ui/
  main.tsx                 # React entry point
  App.tsx                  # Main app component
  App.css                  # Styling
  components/
    ScenarioForm.tsx       # Scenario configuration form
    ResultsCard.tsx        # Results display
test/
  wilson.test.ts           # Wilson CI tests
  dice.test.ts             # Dice scenario tests
  cards.test.ts            # Cards scenario tests
  binomial.test.ts         # Binomial scenario tests
  features.test.ts         # Integration tests
```

## License

MIT
