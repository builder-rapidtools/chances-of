import { Clock, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ResultData, RequestPayload } from '../App';

export interface HistoryEntry {
  scenario: string;
  params: any;
  options: any;
  probability: number;
  ci_low: number | null;
  ci_high: number | null;
  exact: boolean;
  timestamp: number;
}

interface HistoryPanelProps {
  history: HistoryEntry[];
  onRestore: (entry: HistoryEntry) => void;
}

function getConditionSummary(scenario: string, params: any): string {
  if (scenario === 'dice') {
    const { dice, sides, condition } = params;
    return `${dice}d${sides}: ${condition}`;
  }

  if (scenario === 'cards') {
    const { draw, condition } = params;
    return `Draw ${draw}: ${condition}`;
  }

  if (scenario === 'binomial') {
    const { n, p, condition } = params;
    return `n=${n}, p=${(p * 100).toFixed(0)}%: ${condition}`;
  }

  return scenario;
}

function HistoryPanel({ history, onRestore }: HistoryPanelProps) {
  if (history.length === 0) {
    return null;
  }

  return (
    <Card className="shadow-soft border-dashed">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          Recent experiments
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {history.map((entry, index) => {
            const ciWidth =
              entry.ci_low !== null && entry.ci_high !== null
                ? entry.ci_high - entry.ci_low
                : null;

            return (
              <button
                key={`${entry.timestamp}-${index}`}
                onClick={() => onRestore(entry)}
                className="w-full text-left p-3 rounded-lg border border-border bg-card hover:bg-accent hover:border-accent-foreground/20 transition-all duration-200 group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs font-mono">
                        {entry.scenario}
                      </Badge>
                      <Badge variant={entry.exact ? 'default' : 'secondary'} className="text-xs">
                        {entry.exact ? 'Exact' : ciWidth ? `±${(ciWidth * 100).toFixed(3)}%` : 'Estimate'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground font-mono truncate">
                      {getConditionSummary(entry.scenario, entry.params)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <div className="text-xl font-bold text-primary">
                        {(entry.probability * 100).toFixed(1)}%
                      </div>
                    </div>
                    <RotateCcw className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default HistoryPanel;
