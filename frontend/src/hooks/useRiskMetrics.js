import { useState, useEffect } from 'react';
import { getRiskMetrics, getVaR } from '../services/riskService';

export function useRiskMetrics(regime = null) {
  const [metrics, setMetrics] = useState(null);
  const [var_,    setVar]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([getRiskMetrics(regime), getVaR()])
      .then(([m, v]) => { if (!cancelled) { setMetrics(m); setVar(v); } })
      .catch(err => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [regime]);

  return { metrics, var: var_, loading, error };
}
