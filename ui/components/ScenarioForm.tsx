import { useState } from 'react';

interface ScenarioFormProps {
  onRun: (scenario: string, params: any, options: any) => void;
  loading: boolean;
}

function ScenarioForm({ onRun, loading }: ScenarioFormProps) {
  const [scenario, setScenario] = useState<'dice' | 'cards' | 'binomial'>('dice');

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
  const [trials, setTrials] = useState(100000);
  const [seed, setSeed] = useState(42);
  const [useTargetCI, setUseTargetCI] = useState(false);
  const [targetCIWidth, setTargetCIWidth] = useState(0.01);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let params: any = {};
    let options: any = {
      seed,
      exact: useExact,
    };

    if (!useExact) {
      if (useTargetCI) {
        options.target_ci_width = targetCIWidth;
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

  return (
    <div className="scenario-form">
      <h2>Configure Scenario</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Scenario</label>
          <select
            value={scenario}
            onChange={(e) => setScenario(e.target.value as any)}
            className="form-control"
          >
            <option value="dice">Dice</option>
            <option value="cards">Cards</option>
            <option value="binomial">Binomial</option>
          </select>
        </div>

        {scenario === 'dice' && (
          <>
            <div className="form-row">
              <div className="form-group">
                <label>Dice</label>
                <input
                  type="number"
                  value={dice}
                  onChange={(e) => setDice(Number(e.target.value))}
                  min="1"
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Sides</label>
                <input
                  type="number"
                  value={sides}
                  onChange={(e) => setSides(Number(e.target.value))}
                  min="2"
                  className="form-control"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Condition</label>
              <input
                type="text"
                value={diceCondition}
                onChange={(e) => setDiceCondition(e.target.value)}
                placeholder="sum>=10, sum==7, max>=5, min>=3"
                className="form-control"
              />
              <small className="hint">sum&gt;=X, sum==X, max&gt;=X, min&gt;=X</small>
            </div>
          </>
        )}

        {scenario === 'cards' && (
          <>
            <div className="form-group">
              <label>Draw (cards)</label>
              <input
                type="number"
                value={draw}
                onChange={(e) => setDraw(Number(e.target.value))}
                min="1"
                max="52"
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Condition</label>
              <input
                type="text"
                value={cardsCondition}
                onChange={(e) => setCardsCondition(e.target.value)}
                placeholder="aces>=2, hearts>=3"
                className="form-control"
              />
              <small className="hint">aces&gt;=k, hearts&gt;=k, any_rank=K, any_suit=hearts</small>
            </div>
          </>
        )}

        {scenario === 'binomial' && (
          <>
            <div className="form-row">
              <div className="form-group">
                <label>n (trials)</label>
                <input
                  type="number"
                  value={n}
                  onChange={(e) => setN(Number(e.target.value))}
                  min="1"
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>p (probability)</label>
                <input
                  type="number"
                  value={p}
                  onChange={(e) => setP(Number(e.target.value))}
                  min="0"
                  max="1"
                  step="0.01"
                  className="form-control"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Condition</label>
              <input
                type="text"
                value={binomialCondition}
                onChange={(e) => setBinomialCondition(e.target.value)}
                placeholder="successes>=3, successes==5"
                className="form-control"
              />
              <small className="hint">successes&gt;=X, successes==X</small>
            </div>
          </>
        )}

        <div className="divider" />

        <h3>Options</h3>

        {(scenario === 'cards' || scenario === 'binomial') && (
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={useExact}
                onChange={(e) => setUseExact(e.target.checked)}
              />
              <span>Use exact calculation</span>
            </label>
            {scenario === 'cards' && useExact && (
              <small className="hint">Only for aces&gt;=k and hearts&gt;=k</small>
            )}
          </div>
        )}

        {!useExact && (
          <>
            <div className="form-group">
              <label>Seed</label>
              <input
                type="number"
                value={seed}
                onChange={(e) => setSeed(Number(e.target.value))}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={useTargetCI}
                  onChange={(e) => setUseTargetCI(e.target.checked)}
                />
                <span>Precision-stop mode</span>
              </label>
            </div>

            {useTargetCI ? (
              <div className="form-group">
                <label>Target CI Width</label>
                <input
                  type="number"
                  value={targetCIWidth}
                  onChange={(e) => setTargetCIWidth(Number(e.target.value))}
                  min="0.001"
                  max="1"
                  step="0.001"
                  className="form-control"
                />
              </div>
            ) : (
              <div className="form-group">
                <label>Trials</label>
                <input
                  type="number"
                  value={trials}
                  onChange={(e) => setTrials(Number(e.target.value))}
                  min="1000"
                  step="1000"
                  className="form-control"
                />
              </div>
            )}
          </>
        )}

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Running...' : 'Run Simulation'}
        </button>
      </form>
    </div>
  );
}

export default ScenarioForm;
