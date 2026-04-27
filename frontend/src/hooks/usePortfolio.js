import { useState, useCallback } from 'react';
import { simulatePortfolio, getMonteCarlo } from '../services/portfolioService';
import { estimatePortfolioMetrics, ASSET_STATS } from '../utils/calculations';

export function usePortfolio() {
  const [weights, setWeights] = useState({
    SP500: 0.40, GOLD: 0.25, BTC: 0.20, BONDS: 0.15,
  });
  const [monteCarlo, setMonteCarlo] = useState(null);
  const [simulating, setSimulating] = useState(false);
  const [error,      setError]      = useState(null);

  // Live estimated metrics (no API call needed, instant)
  const liveMetrics = estimatePortfolioMetrics(weights, ASSET_STATS);

  const updateWeight = useCallback((asset, value) => {
    setWeights(prev => ({ ...prev, [asset]: parseFloat(value) }));
  }, []);

  const runMonteCarlo = useCallback(async () => {
    setSimulating(true);
    setError(null);
    try {
      const data = await getMonteCarlo();
      setMonteCarlo(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSimulating(false);
    }
  }, []);

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);

  return {
    weights, updateWeight, totalWeight,
    liveMetrics, monteCarlo, runMonteCarlo,
    simulating, error,
  };
}
