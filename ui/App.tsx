import { useState } from 'react';
import ScenarioForm from './components/ScenarioForm';
import ResultsCard from './components/ResultsCard';

export interface ResultData {
  scenario: string;
  params: any;
  trials: number;
  successes: number | null;
  probability: number;
  ci_low: number | null;
  ci_high: number | null;
  exact: boolean;
  time_ms: number;
  stop_reason: string | null;
}

function App() {
  const [result, setResult] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRun = async (scenario: string, params: any, options: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scenario,
          params,
          options,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to run simulation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>chances-of</h1>
        <p className="subtitle">Probability Explorer</p>
      </header>

      <div className="app-container">
        <div className="left-panel">
          <ScenarioForm onRun={handleRun} loading={loading} />
          {error && (
            <div className="error-message">
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>

        <div className="right-panel">
          <ResultsCard result={result} loading={loading} />
        </div>
      </div>
    </div>
  );
}

export default App;
