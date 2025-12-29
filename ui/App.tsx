import { useState, useRef } from 'react';
import { TooltipProvider } from './components/ui/tooltip';
import { ThemeProvider } from './components/theme-provider';
import Header from './components/Header';
import IntroSection from './components/IntroSection';
import ConfigPanel, { ConfigPanelRef } from './components/ConfigPanel';
import ResultsPanel from './components/ResultsPanel';
import HistoryPanel, { HistoryEntry } from './components/HistoryPanel';

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
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const configPanelRef = useRef<ConfigPanelRef>(null);

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

      // Add to history (keep last 5)
      const historyEntry: HistoryEntry = {
        scenario,
        params,
        options,
        probability: data.probability,
        ci_low: data.ci_low,
        ci_high: data.ci_high,
        exact: data.exact,
        timestamp: Date.now(),
      };
      setHistory((prev) => [historyEntry, ...prev].slice(0, 5));
    } catch (err: any) {
      setError(err.message || 'Failed to run simulation');
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreFromHistory = (entry: HistoryEntry) => {
    // Restore configuration via ref callback
    if (configPanelRef.current) {
      configPanelRef.current.restoreConfig(entry.scenario, entry.params, entry.options);
    }
    // Immediately re-run with restored config
    handleRun(entry.scenario, entry.params, entry.options);
  };

  return (
    <ThemeProvider defaultTheme="system" storageKey="chances-of-theme">
      <TooltipProvider delayDuration={200}>
        <div className="min-h-screen bg-background">
          <div className="gradient-hero">
            <Header result={result} requestPayload={requestPayload} />
            <IntroSection />

            <main className="container mx-auto px-4 py-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <ConfigPanel
                    ref={configPanelRef}
                    onRun={handleRun}
                    loading={loading}
                    error={error}
                  />
                </div>

                <div className="space-y-6">
                  <ResultsPanel
                    result={result}
                    loading={loading}
                    requestPayload={requestPayload}
                  />
                  <HistoryPanel
                    history={history}
                    onRestore={handleRestoreFromHistory}
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
