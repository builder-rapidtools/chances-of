import { Dices, Spade, BarChart3, Settings, Play, Eye, HelpCircle } from 'lucide-react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';

export function HowToUseGuide() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Eye className="mr-2 h-4 w-4" />
          How to Use
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">How to Use chances-of</DialogTitle>
          <DialogDescription>
            A quick guide to exploring probability scenarios
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Section 1: Quick Start */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Play className="h-5 w-5 text-primary" />
              Quick Start
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                1. <strong className="text-foreground">Choose a scenario</strong> from the tabs: Dice, Cards, or Binomial (repeated trials)
              </p>
              <p>
                2. <strong className="text-foreground">Configure parameters</strong> like number of dice, card draws, or trial counts
              </p>
              <p>
                3. <strong className="text-foreground">Set your condition</strong> (e.g., "sum&gt;=10" for dice)
              </p>
              <p>
                4. <strong className="text-foreground">Click Run</strong> to see probability and confidence intervals
              </p>
            </div>
          </div>

          <Separator />

          {/* Section 2: Scenarios */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Scenarios</h3>

            <div className="space-y-4">
              {/* Dice */}
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center">
                  <Dices className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-medium">Dice</h4>
                  <p className="text-sm text-muted-foreground">
                    Roll dice and check conditions like sum, max, or min values.
                  </p>
                  <p className="text-xs font-mono bg-muted/30 px-2 py-1 rounded inline-block">
                    Examples: sum&gt;=10, max&gt;=5, min&gt;=3
                  </p>
                </div>
              </div>

              {/* Cards */}
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center">
                  <Spade className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-medium">Cards</h4>
                  <p className="text-sm text-muted-foreground">
                    Draw from a standard 52-card deck (without replacement).
                  </p>
                  <p className="text-xs font-mono bg-muted/30 px-2 py-1 rounded inline-block">
                    Examples: aces&gt;=2, hearts&gt;=3, any_rank=K
                  </p>
                </div>
              </div>

              {/* Binomial */}
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-medium flex items-center gap-2">
                    Binomial
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-muted text-muted-foreground text-xs hover:bg-muted-foreground/20 transition-colors"
                        >
                          <HelpCircle className="h-3 w-3" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent side="bottom" align="start" className="max-w-xs">
                        <p className="font-semibold mb-1">What's Binomial?</p>
                        <p className="text-xs">Repeating the same yes/no experiment multiple times. Like flipping a coin 10 times, or trying to make 20 basketball shots where each shot has a 60% success rate. Each trial is independent with the same probability.</p>
                      </PopoverContent>
                    </Popover>
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Model independent trials with a fixed success probability.
                  </p>
                  <p className="text-xs font-mono bg-muted/30 px-2 py-1 rounded inline-block">
                    Examples: successes&gt;=3, successes==5
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Section 3: Options */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Advanced Options
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <strong className="text-foreground">Exact Calculation</strong>
                <p className="text-muted-foreground">
                  Use mathematical formulas (hypergeometric or binomial) instead of Monte Carlo. No confidence intervals needed.
                </p>
              </div>
              <div>
                <strong className="text-foreground">Precision-Stop Mode</strong>
                <p className="text-muted-foreground">
                  Automatically stop when confidence interval reaches target width. Useful for achieving specific precision.
                </p>
              </div>
              <div>
                <strong className="text-foreground">Seed</strong>
                <p className="text-muted-foreground">
                  Set random seed for reproducible results. Same seed = same results.
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Section 4: Understanding Results */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Understanding Results</h3>
            <div className="space-y-3 text-sm">
              <div className="bg-muted/30 p-3 rounded-lg">
                <strong className="text-foreground">Probability</strong>
                <p className="text-muted-foreground mt-1">
                  The estimated or exact likelihood of your condition being met.
                </p>
              </div>
              <div className="bg-muted/30 p-3 rounded-lg">
                <strong className="text-foreground">95% Confidence Interval</strong>
                <p className="text-muted-foreground mt-1">
                  For Monte Carlo: range where true probability likely falls. Narrower = more precise estimate.
                </p>
              </div>
              <div className="bg-muted/30 p-3 rounded-lg">
                <strong className="text-foreground">Exact vs Estimate</strong>
                <p className="text-muted-foreground mt-1">
                  Exact uses math formulas (no uncertainty). Estimate uses simulation (has sampling uncertainty shown by CI).
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Section 5: Tips */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">💡 Tips</h3>
            <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
              <li>Try the <strong className="text-foreground">presets</strong> to see example scenarios</li>
              <li>Use <strong className="text-foreground">exact mode</strong> when available for perfect accuracy</li>
              <li>Increase <strong className="text-foreground">trials</strong> for narrower confidence intervals</li>
              <li>Click the <strong className="text-foreground">copy buttons</strong> in the header to save CLI commands or JSON results</li>
              <li>Toggle <strong className="text-foreground">dark mode</strong> for comfortable viewing</li>
            </ul>
          </div>
        </div>

        {/* Close button for mobile */}
        <div className="pt-4 sm:hidden">
          <DialogClose asChild>
            <Button variant="outline" className="w-full">
              Close
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
