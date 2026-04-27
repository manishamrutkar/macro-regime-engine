import { useState, useEffect } from 'react';
import { getForecast } from '../services/forecastService';

export function useForecast() {
  const [forecast, setForecast] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    getForecast()
      .then(setForecast)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { forecast, loading, error };
}
