import { useState, forwardRef, useImperativeHandle } from 'react';
import { ChevronDown, Play, RotateCcw, Sparkles, Check, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Separator } from './ui/separator';
import { presets } from '../lib/presets';
import { parseNaturalLanguage, ParsedScenario } from '../lib/nlParser';

interface ConfigPanelProps {
  onRun: (scenario: string, params: any, options: any) => void;
  loading: boolean;
  error: string | null;
}

export interface ConfigPanelRef {
  restoreConfig: (scenario: string, params: any, options: any) => void;
}

const ConfigPanel = forwardRef<ConfigPanelRef, ConfigPanelProps>(({ onRun, loading, error }, ref) => {
  const [scenario, setScenario] = useState<'dice' | 'cards' | 'binomial'>('dice');
  const [advancedOpen, setAdvancedOpen] = useState(false);

  // Natural language input
  const [nlInput, setNlInput] = useState('');
  const [parsedScenario, setParsedScenario] = useState<ParsedScenario | null>(null);

  // Dice state
  const [dice, setDice] = useState(2);
  const [sides, setSides] = useState(6);
  const [diceCondition, setDiceCondition] = useState('sum>=10');

  // Cards state
  const [draw, setDraw] = useState(2);
  const [cardsCondition, setCardsCondition] = useState('aces>=2');

  // Binomial state
  const [n, setN] = useState(20);
  const [p, setP] = useState(0.1);
  const [binomialCondition, setBinomialCondition] = useState('successes>=3');

  // Options
  const [useExact, setUseExact] = useState(false);
  const [seed, setSeed] = useState(42);
  const [usePrecisionStop, setUsePrecisionStop] = useState(false);
  const [trials, setTrials] = useState(100000);
  const [targetCIWidth, setTargetCIWidth] = useState(0.01);
  const [maxTrials, setMaxTrials] = useState(5000000);
  const [batchSize, setBatchSize] = useState(10000);

  // Expose restoreConfig method via ref
  useImperativeHandle(ref, () => ({
    restoreConfig: (scenario: string, params: any, options: any) => {
      setScenario(scenario as 'dice' | 'cards' | 'binomial');

      // Restore params based on scenario
      if (scenario === 'dice') {
        setDice(params.dice || 2);
        setSides(params.sides || 6);
        setDiceCondition(params.condition || 'sum>=10');
      } else if (scenario === 'cards') {
        setDraw(params.draw || 2);
        setCardsCondition(params.condition || 'aces>=2');
      } else if (scenario === 'binomial') {
        setN(params.n || 20);
        setP(params.p || 0.1);
        setBinomialCondition(params.condition || 'successes>=3');
      }

      // Restore options
      setUseExact(options.exact || false);
      setSeed(options.seed || 42);

      if (options.target_ci_width !== undefined) {
        setUsePrecisionStop(true);
        setTargetCIWidth(options.target_ci_width);
        setMaxTrials(options.max_trials || 5000000);
        setBatchSize(options.batch || 10000);
      } else if (options.trials !== undefined) {
        setUsePrecisionStop(false);
        setTrials(options.trials);
      }
    },
  }));

  const handleNaturalLanguageInput = (input: string) => {
    setNlInput(input);
    if (input.trim().length > 0) {
      const parsed = parseNaturalLanguage(input);
      setParsedScenario(parsed);
    } else {
      setParsedScenario(null);
    }
  };

  const applyParsedScenario = () => {
    if (!parsedScenario || !parsedScenario.scenario) return;

    // Apply to form state
    if (parsedScenario.scenario === 'dice') {
      setScenario('dice');
      setDice(parsedScenario.params.dice);
      setSides(parsedScenario.params.sides);
      setDiceCondition(parsedScenario.params.condition);
    } else if (parsedScenario.scenario === 'cards') {
      setScenario('cards');
      setDraw(parsedScenario.params.draw);
      setCardsCondition(parsedScenario.params.condition);
    } else if (parsedScenario.scenario === 'binomial') {
      setScenario('binomial');
      setN(parsedScenario.params.n);
      setP(parsedScenario.params.p);
      setBinomialCondition(parsedScenario.params.condition);
    }

    // Apply options
    if (parsedScenario.options.exact !== undefined) {
      setUseExact(parsedScenario.options.exact);
    }
    if (parsedScenario.options.seed !== undefined) {
      setSeed(parsedScenario.options.seed);
    }
    if (parsedScenario.options.trials !== undefined) {
      setTrials(parsedScenario.options.trials);
    }

    // Clear NL input after applying
    setNlInput('');
    setParsedScenario(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let params: any = {};
    let options: any = {
      seed,
      exact: useExact,
    };

    if (!useExact) {
      if (usePrecisionStop) {
        options.target_ci_width = targetCIWidth;
        options.max_trials = maxTrials;
        options.batch = batchSize;
      } else {
        options.trials = trials;
      }
    }

    switch (scenario) {
      case 'dice':
        params = { dice, sides, condition: diceCondition };
        break;
      case 'cards':
        params = { draw, condition: cardsCondition };
        break;
      case 'binomial':
        params = { n, p, condition: binomialCondition };
        break;
    }

    onRun(scenario, params, options);
  };

  const handleReset = () => {
    setDice(2);
    setSides(6);
    setDiceCondition('sum>=10');
    setDraw(2);
    setCardsCondition('aces>=2');
    setN(20);
    setP(0.1);
    setBinomialCondition('successes>=3');
    setUseExact(false);
    setSeed(42);
    setUsePrecisionStop(false);
    setTrials(100000);
    setTargetCIWidth(0.01);
  };

  const loadPreset = (presetName: string) => {
    const preset = presets.find((p) => p.name === presetName);
    if (!preset) return;

    setScenario(preset.scenario);

    if (preset.scenario === 'dice') {
      setDice(preset.params.dice);
      setSides(preset.params.sides);
      setDiceCondition(preset.params.condition);
    } else if (preset.scenario === 'cards') {
      setDraw(preset.params.draw);
      setCardsCondition(preset.params.condition);
    } else if (preset.scenario === 'binomial') {
      setN(preset.params.n);
      setP(preset.params.p);
      setBinomialCondition(preset.params.condition);
    }

    setUseExact(preset.options.exact || false);
    setSeed(preset.options.seed || 42);
    setTrials(preset.options.trials || 100000);
    setTargetCIWidth(preset.options.target_ci_width || 0.01);
  };

  return (
    <Card className="shadow-medium">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Configuration
          <Badge variant="secondary" className="text-xs">
            Interactive
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Natural Language Input */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <Label>Describe your scenario</Label>
            </div>
            <Input
              value={nlInput}
              onChange={(e) => handleNaturalLanguageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
              placeholder='Try: "roll 2 dice, sum at least 7" or "draw 5 cards, get 2 aces"'
              className="font-sans"
            />

            {parsedScenario && (
              <div
                className={`rounded-lg border p-3 space-y-2 ${
                  parsedScenario.scenario
                    ? 'bg-primary/5 border-primary/20'
                    : 'bg-destructive/5 border-destructive/20'
                }`}
              >
                <div className="flex items-start gap-2">
                  {parsedScenario.scenario ? (
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1 space-y-2">
                    <div>
                      <p className="text-sm font-medium">
                        {parsedScenario.scenario
                          ? "Here's how we understood that:"
                          : 'Could not parse input'}
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                        {parsedScenario.interpretation}
                      </p>
                    </div>

                    {/* Show examples and transform hint for parse failures */}
                    {!parsedScenario.scenario && parsedScenario.examples && (
                      <div className="space-y-2 pt-2 border-t border-border/50">
                        <p className="text-xs font-medium text-muted-foreground">
                          Examples I can understand:
                        </p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {parsedScenario.examples.map((example, idx) => (
                            <li key={idx} className="font-mono">
                              • {example}
                            </li>
                          ))}
                        </ul>
                        {parsedScenario.transformHint && (
                          <div className="pt-2">
                            <p className="text-xs font-medium text-muted-foreground mb-1">
                              Example transform:
                            </p>
                            <p className="text-xs text-muted-foreground font-mono">
                              {parsedScenario.transformHint}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {parsedScenario.scenario && (
                  <Button
                    type="button"
                    size="sm"
                    variant="default"
                    onClick={applyParsedScenario}
                    className="w-full"
                  >
                    Apply to form
                  </Button>
                )}
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Preset</Label>
            <Select onValueChange={loadPreset}>
              <SelectTrigger>
                <SelectValue placeholder="Explore presets..." />
              </SelectTrigger>
              <SelectContent>
                {presets.map((preset) => (
                  <SelectItem key={preset.name} value={preset.name}>
                    {preset.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <Tabs value={scenario} onValueChange={(v) => setScenario(v as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="dice">Dice</TabsTrigger>
              <TabsTrigger value="cards">Cards</TabsTrigger>
              <TabsTrigger value="binomial">Binomial</TabsTrigger>
            </TabsList>

            <TabsContent value="dice" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dice">Dice</Label>
                  <Input
                    id="dice"
                    type="number"
                    value={dice}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val) && isFinite(val) && val >= 1 && val <= 100) {
                        setDice(val);
                      }
                    }}
                    min="1"
                    max="100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sides">Sides</Label>
                  <Input
                    id="sides"
                    type="number"
                    value={sides}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val) && isFinite(val) && val >= 2 && val <= 10000) {
                        setSides(val);
                      }
                    }}
                    min="2"
                    max="10000"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="diceCondition">Condition</Label>
                <Input
                  id="diceCondition"
                  value={diceCondition}
                  onChange={(e) => setDiceCondition(e.target.value)}
                  placeholder="sum>=10, sum==7, max>=5, min>=3"
                />
                <p className="text-xs text-muted-foreground">
                  sum&gt;=X, sum==X, max&gt;=X, min&gt;=X
                </p>
              </div>
            </TabsContent>

            <TabsContent value="cards" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="draw">Draw (cards)</Label>
                <Input
                  id="draw"
                  type="number"
                  value={draw}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val) && isFinite(val) && val >= 1 && val <= 52) {
                      setDraw(val);
                    }
                  }}
                  min="1"
                  max="52"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cardsCondition">Condition</Label>
                <Input
                  id="cardsCondition"
                  value={cardsCondition}
                  onChange={(e) => setCardsCondition(e.target.value)}
                  placeholder="aces>=2, hearts>=3"
                />
                <p className="text-xs text-muted-foreground">
                  aces&gt;=k, hearts&gt;=k, any_rank=K, any_suit=hearts
                </p>
              </div>
            </TabsContent>

            <TabsContent value="binomial" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="n">n (trials)</Label>
                  <Input
                    id="n"
                    type="number"
                    value={n}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val) && isFinite(val) && val >= 1 && val <= 10000) {
                        setN(val);
                      }
                    }}
                    min="1"
                    max="10000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="p">p (probability)</Label>
                  <Input
                    id="p"
                    type="number"
                    value={p}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val) && isFinite(val) && val > 0 && val <= 1) {
                        setP(val);
                      }
                    }}
                    min="0.001"
                    max="1"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="binomialCondition">Condition</Label>
                <Input
                  id="binomialCondition"
                  value={binomialCondition}
                  onChange={(e) => setBinomialCondition(e.target.value)}
                  placeholder="successes>=3, successes==5"
                />
                <p className="text-xs text-muted-foreground">
                  successes&gt;=X, successes==X
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <Separator />

          {(scenario === 'cards' || scenario === 'binomial') && (
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Exact calculation</Label>
                {scenario === 'cards' && useExact && (
                  <p className="text-xs text-muted-foreground">
                    Only for aces&gt;=k and hearts&gt;=k
                  </p>
                )}
                {useExact && (
                  <p className="text-xs text-muted-foreground">
                    Disables CI (no sampling uncertainty)
                  </p>
                )}
              </div>
              <Switch checked={useExact} onCheckedChange={setUseExact} />
            </div>
          )}

          <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-between"
              >
                <span>Advanced Options</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    advancedOpen ? 'rotate-180' : ''
                  }`}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-4">
              {!useExact && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="seed">Seed</Label>
                    <Input
                      id="seed"
                      type="number"
                      value={seed}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val) && isFinite(val)) {
                          setSeed(val);
                        }
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Precision-stop mode</Label>
                    <Switch
                      checked={usePrecisionStop}
                      onCheckedChange={setUsePrecisionStop}
                    />
                  </div>

                  {usePrecisionStop ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="targetCIWidth">Target CI Width</Label>
                        <Input
                          id="targetCIWidth"
                          type="number"
                          value={targetCIWidth}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val) && isFinite(val) && val > 0 && val <= 1) {
                              setTargetCIWidth(val);
                            }
                          }}
                          min="0.001"
                          max="1"
                          step="0.001"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="maxTrials">Max Trials</Label>
                        <Input
                          id="maxTrials"
                          type="number"
                          value={maxTrials}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (!isNaN(val) && isFinite(val) && val >= 1 && val <= 1000000) {
                              setMaxTrials(val);
                            }
                          }}
                          min="1"
                          max="1000000"
                          step="1000"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="batchSize">Batch Size</Label>
                        <Input
                          id="batchSize"
                          type="number"
                          value={batchSize}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (!isNaN(val) && isFinite(val) && val >= 1) {
                              setBatchSize(val);
                            }
                          }}
                          min="1"
                          step="1000"
                        />
                      </div>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="trials">Trials</Label>
                      <Input
                        id="trials"
                        type="number"
                        value={trials}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (!isNaN(val) && isFinite(val) && val >= 1000 && val <= 1000000) {
                            setTrials(val);
                          }
                        }}
                        min="1000"
                        max="1000000"
                        step="1000"
                      />
                    </div>
                  )}
                </>
              )}
            </CollapsibleContent>
          </Collapsible>

          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              <strong>Error:</strong> {error}
            </div>
          )}

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Simulating...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Explore
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={loading}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
});

ConfigPanel.displayName = 'ConfigPanel';

export default ConfigPanel;
