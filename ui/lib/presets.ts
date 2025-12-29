export interface Preset {
  name: string;
  scenario: 'dice' | 'cards' | 'binomial';
  params: any;
  options: {
    seed?: number;
    trials?: number;
    exact?: boolean;
    target_ci_width?: number;
  };
}

export const presets: Preset[] = [
  {
    name: '2d6 sum ≥ 10',
    scenario: 'dice',
    params: {
      dice: 2,
      sides: 6,
      condition: 'sum>=10',
    },
    options: {
      seed: 42,
      trials: 100000,
    },
  },
  {
    name: '3d6 max ≥ 5',
    scenario: 'dice',
    params: {
      dice: 3,
      sides: 6,
      condition: 'max>=5',
    },
    options: {
      seed: 42,
      trials: 100000,
    },
  },
  {
    name: '2 Aces (exact)',
    scenario: 'cards',
    params: {
      draw: 2,
      condition: 'aces>=2',
    },
    options: {
      exact: true,
    },
  },
  {
    name: '5 cards, ≥3 hearts',
    scenario: 'cards',
    params: {
      draw: 5,
      condition: 'hearts>=3',
    },
    options: {
      seed: 42,
      trials: 100000,
    },
  },
  {
    name: 'Binomial: n=20, p=0.1',
    scenario: 'binomial',
    params: {
      n: 20,
      p: 0.1,
      condition: 'successes>=3',
    },
    options: {
      exact: true,
    },
  },
  {
    name: 'Coin flips: 10 trials',
    scenario: 'binomial',
    params: {
      n: 10,
      p: 0.5,
      condition: 'successes>=7',
    },
    options: {
      seed: 42,
      trials: 50000,
    },
  },
];
