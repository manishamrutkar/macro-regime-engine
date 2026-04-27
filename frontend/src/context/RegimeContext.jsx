import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCurrentRegime } from '../services/regimeService';
import { REFRESH_INTERVAL_MS } from '../utils/constants';

const RegimeContext = createContext(null);

export function RegimeProvider({ children }) {
  const [regime,  setRegime]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetchRegime = useCallback(async () => {
    try {
      const data = await getCurrentRegime();
      setRegime(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRegime();
    const interval = setInterval(fetchRegime, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchRegime]);

  return (
    <RegimeContext.Provider value={{ regime, loading, error, refetch: fetchRegime }}>
      {children}
    </RegimeContext.Provider>
  );
}

export const useRegimeContext = () => {
  const ctx = useContext(RegimeContext);
  if (!ctx) throw new Error('useRegimeContext must be used inside RegimeProvider');
  return ctx;
};
