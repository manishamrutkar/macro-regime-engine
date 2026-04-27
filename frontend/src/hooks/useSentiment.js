import { useState, useEffect } from 'react';
import { getSentimentScores, getFearGreed } from '../services/sentimentService';

export function useSentiment() {
  const [sentiment,  setSentiment]  = useState(null);
  const [fearGreed,  setFearGreed]  = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getSentimentScores(), getFearGreed()])
      .then(([s, fg]) => { if (!cancelled) { setSentiment(s); setFearGreed(fg); } })
      .catch(err => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return { sentiment, fearGreed, loading, error };
}
