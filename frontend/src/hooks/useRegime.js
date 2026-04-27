import { useState, useEffect, useCallback } from 'react';
import { getCurrentRegime, getRegimeHistory, getTransitionMatrix } from '../services/regimeService';

export function useRegime() {
  const [current,    setCurrent]    = useState(null);
  const [history,    setHistory]    = useState([]);
  const [transition, setTransition] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const [cur, hist, trans] = await Promise.all([
        getCurrentRegime(),
        getRegimeHistory(),
        getTransitionMatrix(),
      ]);
      setCurrent(cur);
      setHistory(hist);
      setTransition(trans);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { current, history, transition, loading, error, refetch: fetch };
}
