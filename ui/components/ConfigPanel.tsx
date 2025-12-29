import { useState } from 'react';
import { ChevronDown, Play, RotateCcw } from 'lucide-react';
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

interface ConfigPanelProps {
  onRun: (scenario: string, params: any, options: any) => void;
  loading: boolean;
  error: string | null;
}

function ConfigPanel({ onRun, loading, error }: ConfigPanelProps) {
  const [scenario, setScenario] = useState<'dice' | 'cards' | 'binomial'>('dice');
  const [advancedOpen, setAdvancedOpen] = useState(false);

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
          <div className="space-y-2">
            <Label>Preset</Label>
            <Select onValueChange={loadPreset}>
              <SelectTrigger>
                <SelectValue placeholder="Load preset..." />
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
                    onChange={(e) => setDice(Number(e.target.value))}
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sides">Sides</Label>
                  <Input
                    id="sides"
                    type="number"
                    value={sides}
                    onChange={(e) => setSides(Number(e.target.value))}
                    min="2"
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
                  onChange={(e) => setDraw(Number(e.target.value))}
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
                    onChange={(e) => setN(Number(e.target.value))}
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="p">p (probability)</Label>
                  <Input
                    id="p"
                    type="number"
                    value={p}
                    onChange={(e) => setP(Number(e.target.value))}
                    min="0"
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
                      onChange={(e) => setSeed(Number(e.target.value))}
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
                          onChange={(e) =>
                            setTargetCIWidth(Number(e.target.value))
                          }
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
                          onChange={(e) => setMaxTrials(Number(e.target.value))}
                          step="1000"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="batchSize">Batch Size</Label>
                        <Input
                          id="batchSize"
                          type="number"
                          value={batchSize}
                          onChange={(e) => setBatchSize(Number(e.target.value))}
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
                        onChange={(e) => setTrials(Number(e.target.value))}
                        min="1000"
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
                  Running...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Run
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
}

export default ConfigPanel;
