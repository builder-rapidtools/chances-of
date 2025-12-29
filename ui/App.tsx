import { useState } from 'react';
import { TooltipProvider } from './components/ui/tooltip';
import { ThemeProvider } from './components/theme-provider';
import Header from './components/Header';
import ConfigPanel from './components/ConfigPanel';
import ResultsPanel from './components/ResultsPanel';

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

export interface RequestPayload {
  scenario: string;
  params: any;
  options: any;
}

function App() {
  const [result, setResult] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestPayload, setRequestPayload] = useState<RequestPayload | null>(
    null
  );

  const handleRun = async (scenario: string, params: any, options: any) => {
    setLoading(true);
    setError(null);

    const payload = {
      scenario,
      params,
      options,
    };
    setRequestPayload(payload);

    try {
      const response = await fetch('/api/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
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
    <ThemeProvider defaultTheme="system" storageKey="chances-of-theme">
      <TooltipProvider>
        <div className="min-h-screen bg-background">
          <div className="gradient-hero">
            <Header result={result} requestPayload={requestPayload} />

            <main className="container mx-auto px-4 py-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <ConfigPanel onRun={handleRun} loading={loading} error={error} />
                </div>

                <div>
                  <ResultsPanel
                    result={result}
                    loading={loading}
                    requestPayload={requestPayload}
                  />
                </div>
              </div>
            </main>
          </div>
        </div>
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
