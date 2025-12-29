import { Sparkles, Info, TrendingUp, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ResultData, RequestPayload } from '../App';

function generateNaturalLanguageExplanation(result: ResultData): string {
  const { scenario, params, probability, exact } = result;
  const pct = (probability * 100).toFixed(1);

  if (scenario === 'dice') {
    const { dice, sides, condition } = params;
    const diceStr = `${dice} ${dice === 1 ? 'die' : 'dice'} with ${sides} ${sides === 1 ? 'side' : 'sides'}`;

    if (condition.includes('sum>=')) {
      const target = condition.match(/\d+/)?.[0];
      return `When rolling ${diceStr}, there's a ${pct}% chance that the sum of all dice will be ${target} or higher.`;
    } else if (condition.includes('sum==')) {
      const target = condition.match(/\d+/)?.[0];
      return `When rolling ${diceStr}, there's a ${pct}% chance that the sum will be exactly ${target}.`;
    } else if (condition.includes('max>=')) {
      const target = condition.match(/\d+/)?.[0];
      return `When rolling ${diceStr}, there's a ${pct}% chance that at least one die will show ${target} or higher.`;
    } else if (condition.includes('min>=')) {
      const target = condition.match(/\d+/)?.[0];
      return `When rolling ${diceStr}, there's a ${pct}% chance that all dice will show ${target} or higher.`;
    }
  }

  if (scenario === 'cards') {
    const { draw, condition } = params;
    const cardStr = `${draw} ${draw === 1 ? 'card' : 'cards'}`;

    if (condition.includes('aces>=')) {
      const target = condition.match(/\d+/)?.[0];
      return `When drawing ${cardStr} from a standard deck, there's a ${pct}% chance you'll get ${target} or more ${target === '1' ? 'ace' : 'aces'}.`;
    } else if (condition.includes('hearts>=')) {
      const target = condition.match(/\d+/)?.[0];
      return `When drawing ${cardStr} from a standard deck, there's a ${pct}% chance you'll get ${target} or more ${target === '1' ? 'heart' : 'hearts'}.`;
    } else if (condition.includes('any_rank=')) {
      const rank = condition.match(/=(.+)/)?.[1];
      return `When drawing ${cardStr} from a standard deck, there's a ${pct}% chance you'll get at least one ${rank}.`;
    } else if (condition.includes('any_suit=')) {
      const suit = condition.match(/=(.+)/)?.[1];
      return `When drawing ${cardStr} from a standard deck, there's a ${pct}% chance you'll get at least one ${suit} card.`;
    }
  }

  if (scenario === 'binomial') {
    const { n, p, condition } = params;
    const successRate = (p * 100).toFixed(0);

    if (condition.includes('successes>=')) {
      const target = condition.match(/\d+/)?.[0];
      return `If you run ${n} independent trials, each with a ${successRate}% chance of success, there's a ${pct}% probability you'll get ${target} or more successes.`;
    } else if (condition.includes('successes==')) {
      const target = condition.match(/\d+/)?.[0];
      return `If you run ${n} independent trials, each with a ${successRate}% chance of success, there's a ${pct}% probability you'll get exactly ${target} successes.`;
    }
  }

  return `There's a ${pct}% probability that the specified condition will be met.`;
}

interface ResultsPanelProps {
  result: ResultData | null;
  loading: boolean;
  requestPayload: RequestPayload | null;
}

function ResultsPanel({ result, loading, requestPayload }: ResultsPanelProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-20">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4" />
          <p className="text-muted-foreground">Running simulation...</p>
        </CardContent>
      </Card>
    );
  }

  if (!result) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <Sparkles className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Ready to explore</h3>
          <p className="text-muted-foreground max-w-sm">
            Configure a scenario and run a simulation to see probability estimates with uncertainty intervals
          </p>
        </CardContent>
      </Card>
    );
  }

  const ciWidth =
    result.ci_low !== null && result.ci_high !== null
      ? result.ci_high - result.ci_low
      : null;

  return (
    <div className="space-y-6">
      <Card className="shadow-medium transition-all duration-300 ease-in-out animate-in fade-in-50 slide-in-from-bottom-5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Results</CardTitle>
            <Badge variant={result.exact ? 'default' : 'secondary'} className="shadow-sm">
              {result.exact ? '✓ Exact' : '≈ Estimate'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Probability Display */}
          <div className="text-center py-8 px-6 rounded-xl bg-gradient-to-br from-primary/5 via-primary/5 to-primary/10 border border-primary/10">
            <div className="flex items-center justify-center gap-2 mb-3">
              <TrendingUp className="h-5 w-5 text-primary" />
              <div className="text-sm text-muted-foreground uppercase tracking-wide font-medium">
                Probability
              </div>
            </div>
            <div className="text-7xl font-bold bg-gradient-to-br from-primary to-primary/70 bg-clip-text text-transparent mb-2">
              {(result.probability * 100).toFixed(2)}%
            </div>
          </div>

          <Separator />

          {/* Natural Language Explanation */}
          <div className="bg-gradient-to-br from-primary/5 to-transparent rounded-xl p-4 border border-primary/10">
            <div className="flex items-start gap-3">
              <MessageSquare className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">In plain English</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {generateNaturalLanguageExplanation(result)}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* CI Visualization */}
          {result.exact ? (
            <div className="bg-muted/50 rounded-lg p-4 flex items-start gap-3">
              <Info className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Exact result</p>
                <p className="text-xs text-muted-foreground">
                  No sampling uncertainty
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  95% Uncertainty interval
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  ±{((ciWidth || 0) * 50).toFixed(3)}%
                </span>
              </div>

              {/* CI Bar */}
              <div className="relative h-12 bg-muted rounded-lg overflow-hidden">
                {result.ci_low !== null && result.ci_high !== null && (
                  <>
                    {/* CI Range */}
                    <div
                      className="absolute top-0 h-full bg-primary/20"
                      style={{
                        left: `${result.ci_low * 100}%`,
                        width: `${(result.ci_high - result.ci_low) * 100}%`,
                      }}
                    />
                    {/* Probability Point */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-full shadow-lg"
                      style={{
                        left: `${result.probability * 100}%`,
                      }}
                    />
                  </>
                )}
              </div>

              {/* CI Values */}
              <div className="flex justify-between text-xs font-mono text-muted-foreground">
                <span>{((result.ci_low || 0) * 100).toFixed(2)}%</span>
                <span>{((result.ci_high || 0) * 100).toFixed(2)}%</span>
              </div>
            </div>
          )}

          <Separator />

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            {!result.exact && (
              <>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Trials</p>
                  <p className="text-sm font-medium font-mono">
                    {result.trials.toLocaleString()}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Successes</p>
                  <p className="text-sm font-medium font-mono">
                    {result.successes?.toLocaleString() || 'N/A'}
                  </p>
                </div>
              </>
            )}
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Time</p>
              <p className="text-sm font-medium font-mono">{result.time_ms}ms</p>
            </div>
            {result.stop_reason && (
              <div className="space-y-1 col-span-2">
                <p className="text-xs text-muted-foreground">Stop Reason</p>
                <p className="text-sm font-medium">{result.stop_reason}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Interpretation */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium">How to interpret this</p>
                <p className="text-xs text-muted-foreground">
                  {result.exact
                    ? 'This is exact under the assumptions below. No simulation uncertainty.'
                    : 'The interval shows simulation uncertainty. It does not reflect whether your assumptions match reality.'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assumptions Card */}
      {requestPayload && (
        <Card className="shadow-soft transition-all duration-300 ease-in-out animate-in fade-in-50 slide-in-from-bottom-5 border-dashed">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              What this result assumes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted/50 p-4 rounded-xl text-xs overflow-x-auto font-mono border border-border/50">
              {JSON.stringify(requestPayload, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ResultsPanel;
