import { ResultData } from '../App';

interface ResultsCardProps {
  result: ResultData | null;
  loading: boolean;
}

function ResultsCard({ result, loading }: ResultsCardProps) {
  if (loading) {
    return (
      <div className="results-card">
        <div className="loading-state">
          <div className="spinner" />
          <p>Computing probability...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="results-card">
        <div className="empty-state">
          <p>Configure and run a scenario to see results</p>
        </div>
      </div>
    );
  }

  const ciWidth = result.ci_low !== null && result.ci_high !== null
    ? result.ci_high - result.ci_low
    : null;

  return (
    <div className="results-card">
      <h2>Results</h2>

      <div className="probability-display">
        <div className="probability-value">
          {(result.probability * 100).toFixed(2)}%
        </div>
        <div className="probability-label">Probability</div>
      </div>

      {result.ci_low !== null && result.ci_high !== null && (
        <div className="ci-section">
          <div className="ci-label">95% Confidence Interval</div>
          <div className="ci-bar-container">
            <div
              className="ci-bar"
              style={{
                left: `${result.ci_low * 100}%`,
                width: `${(result.ci_high - result.ci_low) * 100}%`,
              }}
            />
            <div
              className="ci-point"
              style={{
                left: `${result.probability * 100}%`,
              }}
            />
          </div>
          <div className="ci-values">
            <span>{(result.ci_low * 100).toFixed(2)}%</span>
            <span>{(result.ci_high * 100).toFixed(2)}%</span>
          </div>
        </div>
      )}

      <div className="metadata">
        <div className="metadata-row">
          <span className="metadata-label">Mode:</span>
          <span className="metadata-value">{result.exact ? 'Exact Calculation' : 'Monte Carlo'}</span>
        </div>
        {!result.exact && (
          <>
            <div className="metadata-row">
              <span className="metadata-label">Trials:</span>
              <span className="metadata-value">{result.trials.toLocaleString()}</span>
            </div>
            <div className="metadata-row">
              <span className="metadata-label">Successes:</span>
              <span className="metadata-value">{result.successes?.toLocaleString() || 'N/A'}</span>
            </div>
            {ciWidth !== null && (
              <div className="metadata-row">
                <span className="metadata-label">CI Width:</span>
                <span className="metadata-value">{(ciWidth * 100).toFixed(3)}%</span>
              </div>
            )}
          </>
        )}
        <div className="metadata-row">
          <span className="metadata-label">Time:</span>
          <span className="metadata-value">{result.time_ms}ms</span>
        </div>
        {result.stop_reason && (
          <div className="metadata-row">
            <span className="metadata-label">Stop Reason:</span>
            <span className="metadata-value">{result.stop_reason}</span>
          </div>
        )}
      </div>

      <div className="assumptions">
        <h3>Assumptions</h3>
        <div className="assumptions-content">
          <div className="assumption-item">
            <strong>Scenario:</strong> {result.scenario}
          </div>
          {Object.entries(result.params).map(([key, value]) => (
            <div key={key} className="assumption-item">
              <strong>{key}:</strong> {String(value)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ResultsCard;
