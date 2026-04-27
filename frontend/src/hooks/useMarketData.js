import { useState, useEffect } from 'react';
import { getTickers, getYieldCurve, getSectors } from '../services/marketService';

export function useMarketData() {
  const [tickers,    setTickers]    = useState(null);
  const [yieldCurve, setYieldCurve] = useState(null);
  const [sectors,    setSectors]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getTickers(), getYieldCurve(), getSectors()])
      .then(([t, y, s]) => {
        if (!cancelled) { setTickers(t); setYieldCurve(y); setSectors(s); }
      })
      .catch(err => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return { tickers, yieldCurve, sectors, loading, error };
}
